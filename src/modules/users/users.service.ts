import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { ChangePasswordAdminDto } from './dto/change-password-admin.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.usersRepository.findByEmail(createUserDto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);

    const user = await this.usersRepository.create({
      email: createUserDto.email,
      passwordHash,
      isActive: true,
    });

    return this.mapToResponse(user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.findAll({});
    return users.map((u) => this.mapToResponse(u));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return this.mapToResponse(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existing = await this.usersRepository.findByEmail(updateUserDto.email);
      if (existing) throw new ConflictException('Email already in use');
    }

    const updateData: any = { ...updateUserDto };
    
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(updateUserDto.password, salt);
      delete updateData.password;
    }

    const updated = await this.usersRepository.update(id, updateData);
    return this.mapToResponse(updated);
  }

  async deactivate(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.update(id, { isActive: false, refreshTokenHash: null });
    return this.mapToResponse(user);
  }

  async reactivate(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.update(id, { isActive: true });
    return this.mapToResponse(user);
  }

  async changePassword(id: string, dto: ChangePasswordAdminDto): Promise<void> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.newPassword, salt);

    await this.usersRepository.update(id, { passwordHash, refreshTokenHash: null });
  }

  async assignRole(id: string, dto: AssignRoleDto): Promise<void> {
    try {
      await this.usersRepository.addRole(id, dto.roleId);
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('Role already assigned');
      if (e.code === 'P2003') throw new BadRequestException('Role does not exist');
      throw e;
    }
  }

  async removeRole(id: string, roleId: string): Promise<void> {
    try {
      await this.usersRepository.removeRole(id, roleId);
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundException('Role assignment not found');
      throw e;
    }
  }

  private mapToResponse(user: any): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.isActive = user.isActive;
    dto.version = user.version;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    
    if (user.roles) {
      dto.roles = user.roles.map((ur: any) => ur.role.name);
    }
    
    return dto;
  }
}
