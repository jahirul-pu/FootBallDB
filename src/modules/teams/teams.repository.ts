import { Injectable } from '@nestjs/common';
import { Prisma, Team, EntityTypeEnum } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../common/database/base.repository';
import { QueryBuilderUtil } from '../../common/database/query-builder.util';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { FilterDto } from '../../common/dto/filter.dto';
import { SortDto } from '../../common/dto/sort.dto';
import { SearchDto } from '../../common/dto/search.dto';

@Injectable()
export class TeamsRepository extends BaseRepository<
  Prisma.TeamDelegate,
  Team,
  Prisma.TeamCreateInput,
  Prisma.TeamUpdateInput,
  Prisma.TeamWhereInput,
  Prisma.TeamOrderByWithRelationInput
> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.team);
  }

  // ---------------------------------------------------------------------------
  // Slug management via polymorphic Alias table
  // ---------------------------------------------------------------------------

  async findBySlug(slug: string): Promise<Team | null> {
    const alias = await this.prisma.alias.findFirst({
      where: {
        entityType: EntityTypeEnum.Team,
        aliasValue: slug,
        deletedAt: null,
      },
    });
    if (!alias) return null;
    return this.findOne({ id: alias.entityId, deletedAt: null });
  }

  async setSlug(teamId: string, slug: string): Promise<void> {
    await this.prisma.alias.deleteMany({
      where: {
        entityType: EntityTypeEnum.Team,
        entityId: teamId,
      },
    });
    await this.prisma.alias.create({
      data: {
        entityType: EntityTypeEnum.Team,
        entityId: teamId,
        aliasValue: slug,
      },
    });
  }

  async getSlug(teamId: string): Promise<string | null> {
    const alias = await this.prisma.alias.findFirst({
      where: {
        entityType: EntityTypeEnum.Team,
        entityId: teamId,
        deletedAt: null,
      },
    });
    return alias?.aliasValue ?? null;
  }

  async isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
    const alias = await this.prisma.alias.findFirst({
      where: {
        entityType: EntityTypeEnum.Team,
        aliasValue: slug,
        deletedAt: null,
        ...(excludeId ? { entityId: { not: excludeId } } : {}),
      },
    });
    return !!alias;
  }

  // ---------------------------------------------------------------------------
  // Paginated search with dynamic filtering and sorting
  // ---------------------------------------------------------------------------

  async search(
    pagination: PaginationDto,
    filters: FilterDto,
    sort: SortDto,
    search: SearchDto,
  ): Promise<{ data: Team[]; total: number }> {
    let where: Prisma.TeamWhereInput = { deletedAt: null };

    if (filters.filters) {
      where = { ...where, ...QueryBuilderUtil.buildWhere(filters.filters) };
    }

    if (search.q) {
      where.OR = [
        { primaryName: { contains: search.q, mode: 'insensitive' } },
        { shortName: { contains: search.q, mode: 'insensitive' } },
      ];
    }

    const orderBy = QueryBuilderUtil.buildOrderBy(
      sort.sort ? sort.sort.split(',') : undefined,
    );
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

  // ---------------------------------------------------------------------------
  // Existence checks for foreign-key validation
  // ---------------------------------------------------------------------------

  async organizationExists(organizationId: string): Promise<boolean> {
    const count = await this.prisma.organization.count({
      where: { id: organizationId, deletedAt: null },
    });
    return count > 0;
  }

  async geopoliticalExists(geopoliticalId: string): Promise<boolean> {
    const count = await this.prisma.geopoliticalEntity.count({
      where: { id: geopoliticalId, deletedAt: null },
    });
    return count > 0;
  }
}
