import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationType } from '@prisma/client';

export class OrganizationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  primaryName!: string;

  @ApiProperty()
  abbreviation!: string;

  @ApiProperty({ enum: OrganizationType })
  orgType!: OrganizationType;

  @ApiPropertyOptional()
  geopoliticalId?: string;

  @ApiProperty()
  foundationYear!: number;

  @ApiPropertyOptional()
  foundationMonth?: number;

  @ApiPropertyOptional()
  foundationDay?: number;

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
