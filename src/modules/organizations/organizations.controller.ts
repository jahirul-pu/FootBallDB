import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { FilterDto } from '../../common/dto/filter.dto';
import { SortDto } from '../../common/dto/sort.dto';
import { SearchDto } from '../../common/dto/search.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly service: OrganizationsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('Administrator', 'Editor')
  @ApiOperation({ summary: 'Create a new Organization' })
  @ApiResponse({ status: HttpStatus.CREATED, type: OrganizationResponseDto })
  create(@Body() dto: CreateOrganizationDto, @CurrentUser() user: any) {
    return this.service.create(dto, user?.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List and search Organizations' })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedResponseDto })
  findAll(
    @Query() pagination: PaginationDto,
    @Query() filters: FilterDto,
    @Query() sort: SortDto,
    @Query() search: SearchDto,
  ) {
    return this.service.findAll(pagination, filters, sort, search);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get an Organization by Slug' })
  @ApiResponse({ status: HttpStatus.OK, type: OrganizationResponseDto })
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an Organization by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: OrganizationResponseDto })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('Administrator', 'Editor')
  @ApiOperation({ summary: 'Update an Organization' })
  @ApiResponse({ status: HttpStatus.OK, type: OrganizationResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrganizationDto,
    @CurrentUser() user: any,
  ) {
    return this.service.update(id, dto, user?.sub);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('Administrator')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete an Organization' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user?.sub);
  }

  @Post(':id/restore')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('Administrator')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Restore a soft-deleted Organization' })
  restore(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.service.restore(id, user?.sub);
  }
}
