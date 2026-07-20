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
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamResponseDto } from './dto/team-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { FilterDto } from '../../common/dto/filter.dto';
import { SortDto } from '../../common/dto/sort.dto';
import { SearchDto } from '../../common/dto/search.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly service: TeamsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('Administrator', 'Editor')
  @ApiOperation({ summary: 'Create a new Team' })
  @ApiResponse({ status: HttpStatus.CREATED, type: TeamResponseDto })
  create(@Body() dto: CreateTeamDto, @CurrentUser() user: any) {
    return this.service.create(dto, user?.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List and search Teams' })
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
  @ApiOperation({ summary: 'Get a Team by Slug' })
  @ApiResponse({ status: HttpStatus.OK, type: TeamResponseDto })
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a Team by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: TeamResponseDto })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('Administrator', 'Editor')
  @ApiOperation({ summary: 'Update a Team' })
  @ApiResponse({ status: HttpStatus.OK, type: TeamResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTeamDto,
    @CurrentUser() user: any,
  ) {
    return this.service.update(id, dto, user?.sub);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('Administrator')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a Team' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user?.sub);
  }

  @Post(':id/restore')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('Administrator')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Restore a soft-deleted Team' })
  restore(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.service.restore(id, user?.sub);
  }
}
