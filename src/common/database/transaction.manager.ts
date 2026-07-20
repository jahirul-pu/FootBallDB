import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransactionManager {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Executes a block of code within a Prisma Interactive Transaction.
   * Useful for ensuring atomicity across multiple repository calls.
   */
  async execute<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    },
  ): Promise<T> {
    return this.prisma.$transaction(fn, options);
  }
}
