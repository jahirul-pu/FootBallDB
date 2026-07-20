import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsRepository } from './organizations.repository';
import { CacheService } from '../../common/cache/cache.service';
import { AuditService } from '../../common/audit/audit.service';
import { OrganizationType } from '@prisma/client';

const mockRepo = {
  create: jest.fn(),
  findOne: jest.fn(),
  findBySlug: jest.fn(),
  setSlug: jest.fn(),
  getSlug: jest.fn(),
  isSlugTaken: jest.fn(),
  update: jest.fn(),
  search: jest.fn(),
};

const mockCache = { get: jest.fn(), set: jest.fn(), del: jest.fn() };
const mockAudit = { log: jest.fn() };

describe('OrganizationsService', () => {
  let service: OrganizationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        { provide: OrganizationsRepository, useValue: mockRepo },
        { provide: CacheService, useValue: mockCache },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();
    service = module.get<OrganizationsService>(OrganizationsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ---------- create ----------
  describe('create', () => {
    const dto = {
      primaryName: 'FIFA',
      orgType: OrganizationType.Global,
      foundationYear: 1904,
      slug: 'fifa',
    };

    it('should throw ConflictException when slug is taken', async () => {
      mockRepo.isSlugTaken.mockResolvedValueOnce(true);
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should create org and assign slug', async () => {
      mockRepo.isSlugTaken.mockResolvedValueOnce(false);
      mockRepo.create.mockResolvedValueOnce({ id: 'org-1', primaryName: 'FIFA', abbreviation: 'FIFA', orgType: OrganizationType.Global, foundationYear: 1904, version: 1, createdAt: new Date(), updatedAt: new Date() });
      const result = await service.create(dto, 'user-1');
      expect(mockRepo.setSlug).toHaveBeenCalledWith('org-1', 'fifa');
      expect(mockAudit.log).toHaveBeenCalled();
      expect(result.primaryName).toBe('FIFA');
      expect(result.slug).toBe('fifa');
    });
  });

  // ---------- findOne ----------
  describe('findOne', () => {
    it('should return cached result immediately', async () => {
      mockCache.get.mockResolvedValueOnce({ id: 'org-1', primaryName: 'FIFA' });
      const result = await service.findOne('org-1');
      expect(result.primaryName).toBe('FIFA');
      expect(mockRepo.findOne).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when org does not exist', async () => {
      mockCache.get.mockResolvedValueOnce(null);
      mockRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should fetch from DB and populate cache', async () => {
      mockCache.get.mockResolvedValueOnce(null);
      mockRepo.findOne.mockResolvedValueOnce({ id: 'org-1', primaryName: 'FIFA', abbreviation: 'FIFA', orgType: OrganizationType.Global, foundationYear: 1904, version: 1, createdAt: new Date(), updatedAt: new Date() });
      mockRepo.getSlug.mockResolvedValueOnce('fifa');
      const result = await service.findOne('org-1');
      expect(result.slug).toBe('fifa');
      expect(mockCache.set).toHaveBeenCalled();
    });
  });

  // ---------- remove ----------
  describe('remove', () => {
    it('should throw NotFoundException for non-existent org', async () => {
      mockRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should soft delete and invalidate cache', async () => {
      mockRepo.findOne.mockResolvedValueOnce({ id: 'org-1' });
      mockRepo.getSlug.mockResolvedValueOnce('fifa');
      await service.remove('org-1', 'user-1');
      expect(mockRepo.update).toHaveBeenCalledWith('org-1', { deletedAt: expect.any(Date) });
      expect(mockCache.del).toHaveBeenCalledWith('organization:id:org-1');
      expect(mockCache.del).toHaveBeenCalledWith('organization:slug:fifa');
    });
  });
});
