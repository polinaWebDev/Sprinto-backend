import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    minLength: 8,
    description: 'Password must be at least 8 characters long',
  })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsString()
  password: string;

  @ApiProperty({
    minLength: 2,
  })
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  firstName: string;

  @ApiProperty({
    minLength: 2,
  })
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  lastName: string;

  @ApiProperty()
  @IsPhoneNumber()
  phoneNumber: string;
}
