import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TeamType, Gender } from '@prisma/client';

export class TeamResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  primaryName!: string;

  @ApiPropertyOptional()
  shortName?: string;

  @ApiProperty({ enum: TeamType })
  teamCategory!: TeamType;

  @ApiProperty({ enum: Gender })
  teamGender!: Gender;

  @ApiProperty()
  governingOrganizationId!: string;

  @ApiProperty()
  geopoliticalId!: string;

  @ApiProperty()
  foundationYear!: number;

  @ApiPropertyOptional()
  foundationMonth?: number;

  @ApiPropertyOptional()
  foundationDay?: number;

  @ApiPropertyOptional()
  dissolutionYear?: number;

  @ApiPropertyOptional()
  dissolutionMonth?: number;

  @ApiPropertyOptional()
  dissolutionDay?: number;

  @ApiPropertyOptional()
  slug?: string;

  @ApiProperty()
  version!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional()
  deletedAt?: Date;
}
