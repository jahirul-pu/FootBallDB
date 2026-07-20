import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PersonsService } from './persons.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { PersonResponseDto } from './dto/person-response.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { FilterDto } from '../../common/dto/filter.dto';
import { SortDto } from '../../common/dto/sort.dto';
import { SearchDto } from '../../common/dto/search.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Persons')
@Controller('persons')
export class PersonsController {
  constructor(private readonly personsService: PersonsService) {}

  @Post()
  @ApiBearerAuth()
  @Roles('Administrator', 'Editor')
  @ApiOperation({ summary: 'Create a new Person' })
  @ApiResponse({ type: PersonResponseDto, status: HttpStatus.CREATED })
  create(@Body() createPersonDto: CreatePersonDto, @CurrentUser() user: any) {
    return this.personsService.create(createPersonDto, user?.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List and search all persons' })
  findAll(
    @Query() pagination: PaginationDto,
    @Query() filters: FilterDto,
    @Query() sort: SortDto,
    @Query() search: SearchDto
  ) {
    return this.personsService.findAll(pagination, filters, sort, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a Person by ID' })
  @ApiResponse({ type: PersonResponseDto })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.personsService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a Person by Slug' })
  @ApiResponse({ type: PersonResponseDto })
  findBySlug(@Param('slug') slug: string) {
    return this.personsService.findBySlug(slug);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles('Administrator', 'Editor')
  @ApiOperation({ summary: 'Update a Person' })
  @ApiResponse({ type: PersonResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updatePersonDto: UpdatePersonDto,
    @CurrentUser() user: any
  ) {
    return this.personsService.update(id, updatePersonDto, user?.sub);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('Administrator')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a Person' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.personsService.remove(id, user?.sub);
  }

  @Post(':id/restore')
  @ApiBearerAuth()
  @Roles('Administrator')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Restore a soft-deleted Person' })
  restore(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.personsService.restore(id, user?.sub);
  }
}
