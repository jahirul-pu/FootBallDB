import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Fédération Internationale de Football Association' })
  @IsString()
  @IsNotEmpty()
  primaryName!: string;

  @ApiPropertyOptional({ example: 'FIFA' })
  @IsString()
  @IsOptional()
  abbreviation?: string;

  @ApiProperty({ enum: OrganizationType, example: OrganizationType.Global })
  @IsEnum(OrganizationType)
  orgType!: OrganizationType;

  @ApiPropertyOptional({ description: 'Geopolitical entity UUID (country/region this org belongs to)' })
  @IsUUID()
  @IsOptional()
  geopoliticalId?: string;

  @ApiProperty({ example: 1904 })
  @IsInt()
  @Min(1800)
  @Max(new Date().getFullYear())
  foundationYear!: number;

  @ApiPropertyOptional({ example: 5 })
  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  foundationMonth?: number;

  @ApiPropertyOptional({ example: 21 })
  @IsInt()
  @Min(1)
  @Max(31)
  @IsOptional()
  foundationDay?: number;

  @ApiPropertyOptional({ description: 'Unique URL-friendly slug' })
  @IsString()
  @IsOptional()
  slug?: string;
}
