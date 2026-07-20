import { Test, TestingModule } from '@nestjs/testing';
import { PersonsService } from './persons.service';
import { PersonsRepository } from './persons.repository';
import { CacheService } from '../../common/cache/cache.service';
import { AuditService } from '../../common/audit/audit.service';
import { TransactionManager } from '../../common/database/transaction.manager';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('PersonsService', () => {
  let service: PersonsService;
  let repo: PersonsRepository;
  let cache: CacheService;

  const mockRepo = {
    create: jest.fn(),
    findOne: jest.fn(),
    findBySlug: jest.fn(),
    setSlug: jest.fn(),
    getSlug: jest.fn(),
    update: jest.fn(),
    search: jest.fn(),
  };

  const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockAudit = { log: jest.fn() };
  
  const mockTx = {
    execute: jest.fn((cb) => cb()),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonsService,
        { provide: PersonsRepository, useValue: mockRepo },
        { provide: CacheService, useValue: mockCache },
        { provide: AuditService, useValue: mockAudit },
        { provide: TransactionManager, useValue: mockTx },
      ],
    }).compile();

    service = module.get<PersonsService>(PersonsService);
    repo = module.get<PersonsRepository>(PersonsRepository);
    cache = module.get<CacheService>(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return from cache if exists', async () => {
      mockCache.get.mockResolvedValueOnce({ id: '123', primaryName: 'Test' });
      const result = await service.findOne('123');
      expect(result.primaryName).toBe('Test');
      expect(mockRepo.findOne).not.toHaveBeenCalled();
    });

    it('should throw NotFound if not in cache or db', async () => {
      mockCache.get.mockResolvedValueOnce(null);
      mockRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.findOne('123')).rejects.toThrow(NotFoundException);
    });

    it('should fetch from db and cache if not in cache', async () => {
      mockCache.get.mockResolvedValueOnce(null);
      mockRepo.findOne.mockResolvedValueOnce({ id: '123', primaryName: 'Test' });
      mockRepo.getSlug.mockResolvedValueOnce('test');
      
      const result = await service.findOne('123');
      
      expect(result.primaryName).toBe('Test');
      expect(result.slug).toBe('test');
      expect(mockCache.set).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should throw if slug collision exists', async () => {
      mockRepo.findBySlug.mockResolvedValueOnce({ id: '123' });
      await expect(service.create({ primaryName: 'Messi', slug: 'lionel-messi', birthYear: 1987 })).rejects.toThrow(ConflictException);
    });

    it('should create person and slug', async () => {
      mockRepo.findBySlug.mockResolvedValueOnce(null);
      mockRepo.create.mockResolvedValueOnce({ id: 'new', primaryName: 'Messi' });
      
      const result = await service.create({ primaryName: 'Messi', slug: 'lionel-messi', birthYear: 1987 });
      
      expect(mockRepo.setSlug).toHaveBeenCalledWith('new', 'lionel-messi');
      expect(result.primaryName).toBe('Messi');
      expect(result.slug).toBe('lionel-messi');
    });
  });
});
