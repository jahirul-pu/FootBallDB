import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordAdminDto {
  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  newPassword!: string;
}
