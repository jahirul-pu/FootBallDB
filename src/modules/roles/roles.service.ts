import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { RolesRepository } from './roles.repository';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async create(createRoleDto: CreateRoleDto) {
    try {
      const { permissionIds, ...rest } = createRoleDto;
      const data: any = { ...rest };
      
      if (permissionIds && permissionIds.length > 0) {
        data.permissions = {
          create: permissionIds.map(id => ({ permission: { connect: { id } } })),
        };
      }
      return await this.rolesRepository.create(data);
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('Role name already exists');
      if (e.code === 'P2025') throw new BadRequestException('Invalid permission ID provided');
      throw e;
    }
  }

  async findAll() {
    return this.rolesRepository.findAll();
  }

  async findOne(id: string) {
    const role = await this.rolesRepository.findById(id);
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    try {
      const { permissionIds, ...rest } = updateRoleDto;
      const data: any = { ...rest };
      
      if (permissionIds) {
        // Replace all permissions
        data.permissions = {
          deleteMany: {},
          create: permissionIds.map(pid => ({ permission: { connect: { id: pid } } })),
        };
      }
      return await this.rolesRepository.update(id, data);
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundException('Role not found');
      if (e.code === 'P2002') throw new ConflictException('Role name already exists');
      throw e;
    }
  }

  async remove(id: string) {
    try {
      return await this.rolesRepository.delete(id);
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundException('Role not found');
      throw e;
    }
  }

  async addPermission(roleId: string, permissionId: string) {
    try {
      await this.rolesRepository.addPermission(roleId, permissionId);
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('Permission already assigned to this role');
      if (e.code === 'P2003') throw new BadRequestException('Role or Permission does not exist');
      throw e;
    }
  }

  async removePermission(roleId: string, permissionId: string) {
    try {
      await this.rolesRepository.removePermission(roleId, permissionId);
    } catch (e: any) {
      if (e.code === 'P2025') throw new NotFoundException('Permission assignment not found');
      throw e;
    }
  }
}
