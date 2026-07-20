import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { FootPreference } from '@prisma/client';

export class CreatePersonDto {
  @ApiProperty({ example: 'Lionel Messi' })
  @IsString()
  @IsNotEmpty()
  primaryName!: string;

  @ApiPropertyOptional({ description: 'Slug alias to uniquely identify this person via URL' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ example: 1987 })
  @IsInt()
  @Min(1800)
  @Max(new Date().getFullYear())
  birthYear!: number;

  @ApiPropertyOptional({ example: 6 })
  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  birthMonth?: number;

  @ApiPropertyOptional({ example: 24 })
  @IsInt()
  @Min(1)
  @Max(31)
  @IsOptional()
  birthDay?: number;

  @ApiPropertyOptional({ example: 'uuid-of-argentina' })
  @IsUUID()
  @IsOptional()
  birthGeopoliticalId?: string;

  @ApiPropertyOptional({ example: 'Rosario' })
  @IsString()
  @IsOptional()
  birthCity?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  deathYear?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  deathMonth?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  deathDay?: number;

  @ApiPropertyOptional({ example: 170 })
  @IsInt()
  @Min(100)
  @Max(250)
  @IsOptional()
  heightCm?: number;

  @ApiPropertyOptional({ enum: FootPreference })
  @IsOptional()
  preferredFoot?: FootPreference;
}
