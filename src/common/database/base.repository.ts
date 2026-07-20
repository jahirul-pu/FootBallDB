import { PrismaService } from './prisma.service';

/**
 * Generic Base Repository providing standard CRUD capabilities via Prisma.
 * Uses Prisma's generic model delegates.
 */
export abstract class BaseRepository<
  TModelDelegate extends {
    findMany: (args: any) => Promise<any>;
    findUnique: (args: any) => Promise<any>;
    findFirst: (args: any) => Promise<any>;
    create: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
    delete: (args: any) => Promise<any>;
    count: (args: any) => Promise<number>;
  },
  TEntity,
  TCreateInput,
  TUpdateInput,
  TWhereInput,
  TOrderByInput
> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly delegate: TModelDelegate,
  ) {}

  async create(data: TCreateInput): Promise<TEntity> {
    return this.delegate.create({ data });
  }

  async findById(id: string): Promise<TEntity | null> {
    return this.delegate.findUnique({ where: { id } as any });
  }

  async findOne(where: TWhereInput): Promise<TEntity | null> {
    return this.delegate.findFirst({ where });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: TWhereInput;
    orderBy?: TOrderByInput | TOrderByInput[];
    include?: any;
  }): Promise<TEntity[]> {
    const { skip, take, where, orderBy, include } = params;
    return this.delegate.findMany({
      skip,
      take,
      where,
      orderBy,
      include,
    });
  }

  async count(where?: TWhereInput): Promise<number> {
    return this.delegate.count({ where });
  }

  async update(id: string, data: TUpdateInput): Promise<TEntity> {
    return this.delegate.update({
      where: { id } as any,
      data,
    });
  }

  async delete(id: string): Promise<TEntity> {
    return this.delegate.delete({ where: { id } as any });
  }
}
