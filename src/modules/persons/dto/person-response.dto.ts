import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FootPreference } from '@prisma/client';

export class PersonResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  primaryName!: string;

  @ApiPropertyOptional()
  slug?: string;

  @ApiProperty()
  birthYear!: number;

  @ApiPropertyOptional()
  birthMonth?: number;

  @ApiPropertyOptional()
  birthDay?: number;

  @ApiPropertyOptional()
  birthGeopoliticalId?: string;

  @ApiPropertyOptional()
  birthCity?: string;

  @ApiPropertyOptional()
  deathYear?: number;

  @ApiPropertyOptional()
  deathMonth?: number;

  @ApiPropertyOptional()
  deathDay?: number;

  @ApiPropertyOptional()
  heightCm?: number;

  @ApiPropertyOptional({ enum: FootPreference })
  preferredFoot?: FootPreference;

  @ApiProperty()
  version!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
