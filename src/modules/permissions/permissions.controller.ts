import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Permissions (Admin)')
@ApiBearerAuth()
@Roles('Administrator')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all available system permissions' })
  findAll() {
    return this.permissionsService.findAll();
  }
}
