import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../common/database/base.repository';
import { Prisma, Person, EntityTypeEnum } from '@prisma/client';
import { QueryBuilderUtil } from '../../common/database/query-builder.util';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { FilterDto } from '../../common/dto/filter.dto';
import { SortDto } from '../../common/dto/sort.dto';
import { SearchDto } from '../../common/dto/search.dto';

@Injectable()
export class PersonsRepository extends BaseRepository<
  Prisma.PersonDelegate,
  Person,
  Prisma.PersonCreateInput,
  Prisma.PersonUpdateInput,
  Prisma.PersonWhereInput,
  Prisma.PersonOrderByWithRelationInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.person);
  }

  async findBySlug(slug: string): Promise<Person | null> {
    const alias = await this.prisma.alias.findFirst({
      where: {
        entityType: EntityTypeEnum.Person,
        aliasValue: slug,
        deletedAt: null,
      },
    });

    if (!alias) return null;

    return this.findOne({ id: alias.entityId, deletedAt: null });
  }

  async setSlug(personId: string, slug: string): Promise<void> {
    // Delete any existing slugs for this person
    await this.prisma.alias.deleteMany({
      where: {
        entityType: EntityTypeEnum.Person,
        entityId: personId,
      },
    });

    // Create the new slug alias
    await this.prisma.alias.create({
      data: {
        entityType: EntityTypeEnum.Person,
        entityId: personId,
        aliasValue: slug,
      },
    });
  }

  async getSlug(personId: string): Promise<string | null> {
    const alias = await this.prisma.alias.findFirst({
      where: {
        entityType: EntityTypeEnum.Person,
        entityId: personId,
        deletedAt: null,
      },
    });
    return alias ? alias.aliasValue : null;
  }

  async search(
    pagination: PaginationDto,
    filters: FilterDto,
    sort: SortDto,
    search: SearchDto
  ): Promise<{ data: Person[]; total: number }> {
    let where: Prisma.PersonWhereInput = { deletedAt: null };

    // Apply generic filters
    if (filters.filters) {
      where = { ...where, ...QueryBuilderUtil.buildWhere(filters.filters) };
    }

    // Apply global text search on primaryName
    if (search.q) {
      where.primaryName = { contains: search.q, mode: 'insensitive' };
    }

    const orderBy = QueryBuilderUtil.buildOrderBy(sort.sort ? sort.sort.split(',') : undefined);
    
    // Default sort
    if (orderBy.length === 0) {
      orderBy.push({ createdAt: 'desc' });
    }

    const [data, total] = await Promise.all([
      this.findAll({
        skip: pagination.skip,
        take: pagination.limit,
        where,
        orderBy,
      }),
      this.count(where),
    ]);

    return { data, total };
  }
}
