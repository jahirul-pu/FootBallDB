import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SortDto {
  @ApiPropertyOptional({ description: 'Comma separated list of sort fields e.g., name:asc,createdAt:desc' })
  @IsString()
  @IsOptional()
  sort?: string;
}
