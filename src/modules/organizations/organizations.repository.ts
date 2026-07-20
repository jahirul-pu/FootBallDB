import { Injectable } from '@nestjs/common';
import { Prisma, Organization, EntityTypeEnum } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../common/database/base.repository';
import { QueryBuilderUtil } from '../../common/database/query-builder.util';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { FilterDto } from '../../common/dto/filter.dto';
import { SortDto } from '../../common/dto/sort.dto';
import { SearchDto } from '../../common/dto/search.dto';

@Injectable()
export class OrganizationsRepository extends BaseRepository<
  Prisma.OrganizationDelegate,
  Organization,
  Prisma.OrganizationCreateInput,
  Prisma.OrganizationUpdateInput,
  Prisma.OrganizationWhereInput,
  Prisma.OrganizationOrderByWithRelationInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.organization);
  }

  // ---------------------------------------------------------------------------
  // Slug (via Alias table)
  // ---------------------------------------------------------------------------

  async findBySlug(slug: string): Promise<Organization | null> {
    const alias = await this.prisma.alias.findFirst({
      where: {
        entityType: EntityTypeEnum.Organization,
        aliasValue: slug,
        deletedAt: null,
      },
    });
    if (!alias) return null;
    return this.findOne({ id: alias.entityId, deletedAt: null });
  }

  async setSlug(organizationId: string, slug: string): Promise<void> {
    await this.prisma.alias.deleteMany({
      where: {
        entityType: EntityTypeEnum.Organization,
        entityId: organizationId,
      },
    });
    await this.prisma.alias.create({
      data: {
        entityType: EntityTypeEnum.Organization,
        entityId: organizationId,
        aliasValue: slug,
      },
    });
  }

  async getSlug(organizationId: string): Promise<string | null> {
    const alias = await this.prisma.alias.findFirst({
      where: {
        entityType: EntityTypeEnum.Organization,
        entityId: organizationId,
        deletedAt: null,
      },
    });
    return alias?.aliasValue ?? null;
  }

  // ---------------------------------------------------------------------------
  // Search
  // ---------------------------------------------------------------------------

  async search(
    pagination: PaginationDto,
    filters: FilterDto,
    sort: SortDto,
    search: SearchDto,
  ): Promise<{ data: Organization[]; total: number }> {
    let where: Prisma.OrganizationWhereInput = { deletedAt: null };

    if (filters.filters) {
      where = { ...where, ...QueryBuilderUtil.buildWhere(filters.filters) };
    }

    if (search.q) {
      where.OR = [
        { primaryName: { contains: search.q, mode: 'insensitive' } },
        { abbreviation: { contains: search.q, mode: 'insensitive' } },
      ];
    }

    const orderBy = QueryBuilderUtil.buildOrderBy(
      sort.sort ? sort.sort.split(',') : undefined,
    );
    if (orderBy.length === 0) {
      orderBy.push({ createdAt: 'desc' });
    }

    const [data, total] = await Promise.all([
      this.findAll({ skip: pagination.skip, take: pagination.limit, where, orderBy }),
      this.count(where),
    ]);

    return { data, total };
  }

  // ---------------------------------------------------------------------------
  // Slug uniqueness check (for validation, excluding current entity)
  // ---------------------------------------------------------------------------

  async isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
    const alias = await this.prisma.alias.findFirst({
      where: {
        entityType: EntityTypeEnum.Organization,
        aliasValue: slug,
        deletedAt: null,
        ...(excludeId ? { entityId: { not: excludeId } } : {}),
      },
    });
    return !!alias;
  }
}
