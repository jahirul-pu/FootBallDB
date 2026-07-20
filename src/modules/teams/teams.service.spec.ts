import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsRepository } from './teams.repository';
import { CacheService } from '../../common/cache/cache.service';
import { AuditService } from '../../common/audit/audit.service';
import { TeamType, Gender } from '@prisma/client';

const mockRepo = {
  create: jest.fn(),
  findOne: jest.fn(),
  findBySlug: jest.fn(),
  setSlug: jest.fn(),
  getSlug: jest.fn(),
  isSlugTaken: jest.fn(),
  update: jest.fn(),
  search: jest.fn(),
  organizationExists: jest.fn(),
  geopoliticalExists: jest.fn(),
};

const mockCache = { get: jest.fn(), set: jest.fn(), del: jest.fn() };
const mockAudit = { log: jest.fn() };

const baseTeam = {
  id: 'team-1',
  primaryName: 'FC Barcelona',
  shortName: 'BAR',
  teamCategory: TeamType.Club,
  teamGender: Gender.Men,
  governingOrganizationId: 'org-1',
  geopoliticalId: 'geo-1',
  foundationYear: 1899,
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('TeamsService', () => {
  let service: TeamsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        { provide: TeamsRepository, useValue: mockRepo },
        { provide: CacheService, useValue: mockCache },
        { provide: AuditService, useValue: mockAudit },
      ],
    }).compile();
    service = module.get<TeamsService>(TeamsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => expect(service).toBeDefined());

  // ---------- create ----------
  describe('create', () => {
    const dto = {
      primaryName: 'FC Barcelona',
      teamCategory: TeamType.Club,
      teamGender: Gender.Men,
      governingOrganizationId: 'org-1',
      geopoliticalId: 'geo-1',
      foundationYear: 1899,
      slug: 'fc-barcelona',
    };

    it('should throw BadRequestException when org does not exist', async () => {
      mockRepo.organizationExists.mockResolvedValueOnce(false);
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when geo does not exist', async () => {
      mockRepo.organizationExists.mockResolvedValueOnce(true);
      mockRepo.geopoliticalExists.mockResolvedValueOnce(false);
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when slug is taken', async () => {
      mockRepo.organizationExists.mockResolvedValueOnce(true);
      mockRepo.geopoliticalExists.mockResolvedValueOnce(true);
      mockRepo.isSlugTaken.mockResolvedValueOnce(true);
      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should create team, assign slug, and log audit', async () => {
      mockRepo.organizationExists.mockResolvedValueOnce(true);
      mockRepo.geopoliticalExists.mockResolvedValueOnce(true);
      mockRepo.isSlugTaken.mockResolvedValueOnce(false);
      mockRepo.create.mockResolvedValueOnce(baseTeam);

      const result = await service.create(dto, 'user-1');

      expect(mockRepo.setSlug).toHaveBeenCalledWith('team-1', 'fc-barcelona');
      expect(mockAudit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'CREATE', entityType: 'Team' }),
      );
      expect(result.primaryName).toBe('FC Barcelona');
      expect(result.slug).toBe('fc-barcelona');
    });
  });

  // ---------- findOne ----------
  describe('findOne', () => {
    it('should return cached result without hitting DB', async () => {
      mockCache.get.mockResolvedValueOnce({ ...baseTeam, slug: 'fc-barcelona' });
      const result = await service.findOne('team-1');
      expect(result.primaryName).toBe('FC Barcelona');
      expect(mockRepo.findOne).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when team does not exist', async () => {
      mockCache.get.mockResolvedValueOnce(null);
      mockRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });

    it('should fetch from DB, populate cache, and return response', async () => {
      mockCache.get.mockResolvedValueOnce(null);
      mockRepo.findOne.mockResolvedValueOnce(baseTeam);
      mockRepo.getSlug.mockResolvedValueOnce('fc-barcelona');

      const result = await service.findOne('team-1');
      expect(result.slug).toBe('fc-barcelona');
      expect(mockCache.set).toHaveBeenCalled();
    });
  });

  // ---------- remove ----------
  describe('remove', () => {
    it('should throw NotFoundException for non-existent team', async () => {
      mockRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
    });

    it('should soft-delete and invalidate cache', async () => {
      mockRepo.findOne.mockResolvedValueOnce(baseTeam);
      mockRepo.getSlug.mockResolvedValueOnce('fc-barcelona');

      await service.remove('team-1', 'user-1');

      expect(mockRepo.update).toHaveBeenCalledWith('team-1', {
        deletedAt: expect.any(Date),
      });
      expect(mockCache.del).toHaveBeenCalledWith('team:id:team-1');
      expect(mockCache.del).toHaveBeenCalledWith('team:slug:fc-barcelona');
    });
  });

  // ---------- update ----------
  describe('update', () => {
    it('should throw NotFoundException when updating non-existent team', async () => {
      mockRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.update('missing', {})).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when new slug is already taken by another team', async () => {
      mockRepo.findOne.mockResolvedValueOnce(baseTeam);
      mockRepo.isSlugTaken.mockResolvedValueOnce(true);
      await expect(service.update('team-1', { slug: 'taken-slug' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('should update team and invalidate cache', async () => {
      mockRepo.findOne.mockResolvedValueOnce(baseTeam);
      mockRepo.isSlugTaken.mockResolvedValueOnce(false);
      mockRepo.update.mockResolvedValueOnce({ ...baseTeam, primaryName: 'Barça' });
      mockRepo.getSlug.mockResolvedValueOnce('fc-barcelona');

      const result = await service.update('team-1', { primaryName: 'Barça', slug: 'fc-barcelona' }, 'user-1');

      expect(result.primaryName).toBe('Barça');
      expect(mockCache.del).toHaveBeenCalledWith('team:id:team-1');
    });
  });
});
