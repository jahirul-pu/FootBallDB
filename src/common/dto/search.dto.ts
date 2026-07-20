import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchDto {
  @ApiPropertyOptional({ description: 'Global text search query' })
  @IsString()
  @IsOptional()
  q?: string;
}
