import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repo: UsersRepository;

  const mockRepo = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<UsersRepository>(UsersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException if email exists', async () => {
      mockRepo.findByEmail.mockResolvedValueOnce({ id: '123' });
      await expect(service.create({ email: 'test@test.com', password: 'password123' })).rejects.toThrow(ConflictException);
    });

    it('should create and return user without passwordHash', async () => {
      mockRepo.findByEmail.mockResolvedValueOnce(null);
      mockRepo.create.mockResolvedValueOnce({ id: '1', email: 'test@test.com', isActive: true });
      
      const result = await service.create({ email: 'test@test.com', password: 'password123' });
      expect(result.email).toBe('test@test.com');
      expect((result as any).passwordHash).toBeUndefined();
    });
  });

  describe('deactivate', () => {
    it('should set isActive to false and clear refreshToken', async () => {
      mockRepo.update.mockResolvedValueOnce({ id: '1', isActive: false });
      
      const result = await service.deactivate('1');
      
      expect(mockRepo.update).toHaveBeenCalledWith('1', { isActive: false, refreshTokenHash: null });
      expect(result.isActive).toBe(false);
    });
  });
});
