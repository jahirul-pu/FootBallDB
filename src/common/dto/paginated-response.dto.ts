import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty()
  itemCount!: number;

  @ApiProperty()
  totalItems!: number;

  @ApiProperty()
  itemsPerPage!: number;

  @ApiProperty()
  totalPages!: number;

  @ApiProperty()
  currentPage!: number;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ type: [Object] })
  data!: T[];

  @ApiProperty()
  meta!: PaginationMetaDto;

  constructor(data: T[], meta: PaginationMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
