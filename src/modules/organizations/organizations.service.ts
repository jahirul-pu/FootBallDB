import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { OrganizationsRepository } from './organizations.repository';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { FilterDto } from '../../common/dto/filter.dto';
import { SortDto } from '../../common/dto/sort.dto';
import { SearchDto } from '../../common/dto/search.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { CacheService } from '../../common/cache/cache.service';
import { AuditService } from '../../common/audit/audit.service';
import { SlugUtil } from '../../common/utils/slug.util';

@Injectable()
export class OrganizationsService {
  private readonly CACHE_TTL = 3600;

  constructor(
    private readonly repo: OrganizationsRepository,
    private readonly cache: CacheService,
    private readonly audit: AuditService,
  ) {}

  // ---------------------------------------------------------------------------
  // Create
  // ---------------------------------------------------------------------------

  async create(dto: CreateOrganizationDto, userId?: string): Promise<OrganizationResponseDto> {
    const slug = dto.slug || SlugUtil.generate(dto.primaryName);

    const slugTaken = await this.repo.isSlugTaken(slug);
    if (slugTaken) {
      throw new ConflictException(`Slug '${slug}' is already in use`);
    }

    const { slug: _slug, ...data } = dto;

    const org = await this.repo.create({
      primaryName: data.primaryName,
      abbreviation: data.abbreviation ?? data.primaryName.slice(0, 20),
      orgType: data.orgType,
      foundationYear: data.foundationYear,
      foundationMonth: data.foundationMonth,
      foundationDay: data.foundationDay,
      ...(data.geopoliticalId
        ? { geopolitical: { connect: { id: data.geopoliticalId } } }
        : {}),
    } as any);

    await this.repo.setSlug(org.id, slug);

    this.audit.log({ entityId: org.id, entityType: 'Organization', action: 'CREATE', userId });

    return this.mapToResponse(org, slug);
  }

  // ---------------------------------------------------------------------------
  // Read
  // ---------------------------------------------------------------------------

  async findAll(
    pagination: PaginationDto,
    filters: FilterDto,
    sort: SortDto,
    search: SearchDto,
  ): Promise<PaginatedResponseDto<OrganizationResponseDto>> {
    const { data, total } = await this.repo.search(pagination, filters, sort, search);
    const mapped = data.map((o) => this.mapToResponse(o));
    return new PaginatedResponseDto(mapped, {
      itemCount: data.length,
      totalItems: total,
      itemsPerPage: pagination.limit ?? 20,
      totalPages: Math.ceil(total / (pagination.limit ?? 20)),
      currentPage: pagination.page ?? 1,
    });
  }

  async findOne(id: string): Promise<OrganizationResponseDto> {
    const cacheKey = `organization:id:${id}`;
    const cached = await this.cache.get<OrganizationResponseDto>(cacheKey);
    if (cached) return cached;

    const org = await this.repo.findOne({ id, deletedAt: null });
    if (!org) throw new NotFoundException('Organization not found');

    const slug = await this.repo.getSlug(id);
    const response = this.mapToResponse(org, slug ?? undefined);
    await this.cache.set(cacheKey, response, this.CACHE_TTL);
    return response;
  }

  async findBySlug(slug: string): Promise<OrganizationResponseDto> {
    const cacheKey = `organization:slug:${slug}`;
    const cached = await this.cache.get<OrganizationResponseDto>(cacheKey);
    if (cached) return cached;

    const org = await this.repo.findBySlug(slug);
    if (!org) throw new NotFoundException('Organization not found');

    const response = this.mapToResponse(org, slug);
    await this.cache.set(cacheKey, response, this.CACHE_TTL);
    return response;
  }

  // ---------------------------------------------------------------------------
  // Update
  // ---------------------------------------------------------------------------

  async update(id: string, dto: UpdateOrganizationDto, userId?: string): Promise<OrganizationResponseDto> {
    const existing = await this.repo.findOne({ id, deletedAt: null });
    if (!existing) throw new NotFoundException('Organization not found');

    const { slug, geopoliticalId, ...rest } = dto;

    if (slug) {
      const taken = await this.repo.isSlugTaken(slug, id);
      if (taken) throw new ConflictException(`Slug '${slug}' is already in use`);
      await this.repo.setSlug(id, slug);
    }

    const updatePayload: any = {
      ...rest,
      version: { increment: 1 },
      ...(geopoliticalId !== undefined
        ? { geopolitical: geopoliticalId ? { connect: { id: geopoliticalId } } : { disconnect: true } }
        : {}),
    };

    const updated = await this.repo.update(id, updatePayload);

    this.audit.log({ entityId: id, entityType: 'Organization', action: 'UPDATE', userId, changes: rest });

    const currentSlug = slug ?? (await this.repo.getSlug(id));
    await this.invalidateCache(id, currentSlug ?? undefined);

    return this.mapToResponse(updated, currentSlug ?? undefined);
  }

  // ---------------------------------------------------------------------------
  // Soft Delete & Restore
  // ---------------------------------------------------------------------------

  async remove(id: string, userId?: string): Promise<void> {
    const existing = await this.repo.findOne({ id, deletedAt: null });
    if (!existing) throw new NotFoundException('Organization not found');

    await this.repo.update(id, { deletedAt: new Date() });
    this.audit.log({ entityId: id, entityType: 'Organization', action: 'DELETE', userId });

    const slug = await this.repo.getSlug(id);
    await this.invalidateCache(id, slug ?? undefined);
  }

  async restore(id: string, userId?: string): Promise<void> {
    const existing = await this.repo.findOne({ id, deletedAt: { not: null } });
    if (!existing) throw new NotFoundException('Deleted organization not found');

    await this.repo.update(id, { deletedAt: null });
    this.audit.log({ entityId: id, entityType: 'Organization', action: 'UPDATE', userId });

    const slug = await this.repo.getSlug(id);
    await this.invalidateCache(id, slug ?? undefined);
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private async invalidateCache(id: string, slug?: string): Promise<void> {
    await this.cache.del(`organization:id:${id}`);
    if (slug) await this.cache.del(`organization:slug:${slug}`);
  }

  private mapToResponse(org: any, slug?: string): OrganizationResponseDto {
    const dto = new OrganizationResponseDto();
    Object.assign(dto, org);
    if (slug) dto.slug = slug;
    return dto;
  }
}
