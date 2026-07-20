import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TeamsRepository } from './teams.repository';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamResponseDto } from './dto/team-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { FilterDto } from '../../common/dto/filter.dto';
import { SortDto } from '../../common/dto/sort.dto';
import { SearchDto } from '../../common/dto/search.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { CacheService } from '../../common/cache/cache.service';
import { AuditService } from '../../common/audit/audit.service';
import { SlugUtil } from '../../common/utils/slug.util';

@Injectable()
export class TeamsService {
  private readonly CACHE_TTL = 3600;

  constructor(
    private readonly repo: TeamsRepository,
    private readonly cache: CacheService,
    private readonly audit: AuditService,
  ) {}

  // ---------------------------------------------------------------------------
  // Create
  // ---------------------------------------------------------------------------

  async create(dto: CreateTeamDto, userId?: string): Promise<TeamResponseDto> {
    // Validate foreign keys before write
    const orgExists = await this.repo.organizationExists(dto.governingOrganizationId);
    if (!orgExists) {
      throw new BadRequestException(
        `Organization '${dto.governingOrganizationId}' not found or is deleted`,
      );
    }

    const geoExists = await this.repo.geopoliticalExists(dto.geopoliticalId);
    if (!geoExists) {
      throw new BadRequestException(
        `GeopoliticalEntity '${dto.geopoliticalId}' not found or is deleted`,
      );
    }

    const slug = dto.slug || SlugUtil.generate(dto.primaryName);
    const slugTaken = await this.repo.isSlugTaken(slug);
    if (slugTaken) {
      throw new ConflictException(`Slug '${slug}' is already in use`);
    }

    const { slug: _slug, governingOrganizationId, geopoliticalId, ...rest } = dto;

    const team = await this.repo.create({
      ...rest,
      governingOrganization: { connect: { id: governingOrganizationId } },
      geopolitical: { connect: { id: geopoliticalId } },
    } as any);

    await this.repo.setSlug(team.id, slug);

    this.audit.log({
      entityId: team.id,
      entityType: 'Team',
      action: 'CREATE',
      userId,
    });

    return this.mapToResponse(team, slug);
  }

  // ---------------------------------------------------------------------------
  // Read
  // ---------------------------------------------------------------------------

  async findAll(
    pagination: PaginationDto,
    filters: FilterDto,
    sort: SortDto,
    search: SearchDto,
  ): Promise<PaginatedResponseDto<TeamResponseDto>> {
    const { data, total } = await this.repo.search(pagination, filters, sort, search);
    const mapped = data.map((t) => this.mapToResponse(t));
    return new PaginatedResponseDto(mapped, {
      itemCount: data.length,
      totalItems: total,
      itemsPerPage: pagination.limit ?? 20,
      totalPages: Math.ceil(total / (pagination.limit ?? 20)),
      currentPage: pagination.page ?? 1,
    });
  }

  async findOne(id: string): Promise<TeamResponseDto> {
    const cacheKey = `team:id:${id}`;
    const cached = await this.cache.get<TeamResponseDto>(cacheKey);
    if (cached) return cached;

    const team = await this.repo.findOne({ id, deletedAt: null });
    if (!team) throw new NotFoundException('Team not found');

    const slug = await this.repo.getSlug(id);
    const response = this.mapToResponse(team, slug ?? undefined);
    await this.cache.set(cacheKey, response, this.CACHE_TTL);
    return response;
  }

  async findBySlug(slug: string): Promise<TeamResponseDto> {
    const cacheKey = `team:slug:${slug}`;
    const cached = await this.cache.get<TeamResponseDto>(cacheKey);
    if (cached) return cached;

    const team = await this.repo.findBySlug(slug);
    if (!team) throw new NotFoundException('Team not found');

    const response = this.mapToResponse(team, slug);
    await this.cache.set(cacheKey, response, this.CACHE_TTL);
    return response;
  }

  // ---------------------------------------------------------------------------
  // Update
  // ---------------------------------------------------------------------------

  async update(id: string, dto: UpdateTeamDto, userId?: string): Promise<TeamResponseDto> {
    const existing = await this.repo.findOne({ id, deletedAt: null });
    if (!existing) throw new NotFoundException('Team not found');

    // Validate FK changes if provided
    if (dto.governingOrganizationId) {
      const orgExists = await this.repo.organizationExists(dto.governingOrganizationId);
      if (!orgExists) {
        throw new BadRequestException(
          `Organization '${dto.governingOrganizationId}' not found or is deleted`,
        );
      }
    }

    if (dto.geopoliticalId) {
      const geoExists = await this.repo.geopoliticalExists(dto.geopoliticalId);
      if (!geoExists) {
        throw new BadRequestException(
          `GeopoliticalEntity '${dto.geopoliticalId}' not found or is deleted`,
        );
      }
    }

    const { slug, governingOrganizationId, geopoliticalId, ...rest } = dto;

    if (slug) {
      const taken = await this.repo.isSlugTaken(slug, id);
      if (taken) throw new ConflictException(`Slug '${slug}' is already in use`);
      await this.repo.setSlug(id, slug);
    }

    const updatePayload: any = {
      ...rest,
      version: { increment: 1 },
      ...(governingOrganizationId
        ? { governingOrganization: { connect: { id: governingOrganizationId } } }
        : {}),
      ...(geopoliticalId
        ? { geopolitical: { connect: { id: geopoliticalId } } }
        : {}),
    };

    const updated = await this.repo.update(id, updatePayload);

    this.audit.log({
      entityId: id,
      entityType: 'Team',
      action: 'UPDATE',
      userId,
      changes: rest,
    });

    const currentSlug = slug ?? (await this.repo.getSlug(id));
    await this.invalidateCache(id, currentSlug ?? undefined);

    return this.mapToResponse(updated, currentSlug ?? undefined);
  }

  // ---------------------------------------------------------------------------
  // Soft Delete & Restore
  // ---------------------------------------------------------------------------

  async remove(id: string, userId?: string): Promise<void> {
    const existing = await this.repo.findOne({ id, deletedAt: null });
    if (!existing) throw new NotFoundException('Team not found');

    await this.repo.update(id, { deletedAt: new Date() });

    this.audit.log({ entityId: id, entityType: 'Team', action: 'DELETE', userId });

    const slug = await this.repo.getSlug(id);
    await this.invalidateCache(id, slug ?? undefined);
  }

  async restore(id: string, userId?: string): Promise<void> {
    const existing = await this.repo.findOne({ id, deletedAt: { not: null } });
    if (!existing) throw new NotFoundException('Deleted team not found');

    await this.repo.update(id, { deletedAt: null });

    this.audit.log({ entityId: id, entityType: 'Team', action: 'UPDATE', userId });

    const slug = await this.repo.getSlug(id);
    await this.invalidateCache(id, slug ?? undefined);
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private async invalidateCache(id: string, slug?: string): Promise<void> {
    await this.cache.del(`team:id:${id}`);
    if (slug) await this.cache.del(`team:slug:${slug}`);
  }

  private mapToResponse(team: any, slug?: string): TeamResponseDto {
    const dto = new TeamResponseDto();
    Object.assign(dto, team);
    if (slug) dto.slug = slug;
    return dto;
  }
}
