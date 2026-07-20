import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TeamType, Gender } from '@prisma/client';
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

export class CreateTeamDto {
  @ApiProperty({ example: 'FC Barcelona' })
  @IsString()
  @IsNotEmpty()
  primaryName!: string;

  @ApiPropertyOptional({ example: 'BAR', description: 'Up to 3-character short code' })
  @IsString()
  @IsOptional()
  shortName?: string;

  @ApiProperty({ enum: TeamType, example: TeamType.Club })
  @IsEnum(TeamType)
  teamCategory!: TeamType;

  @ApiPropertyOptional({ enum: Gender, default: Gender.Men })
  @IsEnum(Gender)
  @IsOptional()
  teamGender?: Gender;

  @ApiProperty({ description: 'UUID of the governing Organization (e.g. La Liga, UEFA, FIFA)' })
  @IsUUID()
  @IsNotEmpty()
  governingOrganizationId!: string;

  @ApiProperty({ description: 'UUID of the GeopoliticalEntity (country/region)' })
  @IsUUID()
  @IsNotEmpty()
  geopoliticalId!: string;

  @ApiProperty({ example: 1899 })
  @IsInt()
  @Min(1800)
  @Max(new Date().getFullYear())
  foundationYear!: number;

  @ApiPropertyOptional({ example: 11 })
  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  foundationMonth?: number;

  @ApiPropertyOptional({ example: 29 })
  @IsInt()
  @Min(1)
  @Max(31)
  @IsOptional()
  foundationDay?: number;

  @ApiPropertyOptional({ description: 'Year of dissolution (if club no longer exists)' })
  @IsInt()
  @IsOptional()
  dissolutionYear?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  dissolutionMonth?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  @IsOptional()
  dissolutionDay?: number;

  @ApiPropertyOptional({ description: 'Unique URL-friendly slug (auto-generated if omitted)' })
  @IsString()
  @IsOptional()
  slug?: string;
}
