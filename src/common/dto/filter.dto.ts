import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsObject } from 'class-validator';

export class FilterDto {
  @ApiPropertyOptional({ description: 'Dynamic filter object e.g., {"age.gt": 18, "status.eq": "ACTIVE"}' })
  @IsObject()
  @IsOptional()
  filters?: Record<string, any>;
}
