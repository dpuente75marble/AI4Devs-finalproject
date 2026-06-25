import { ApiProperty } from '@nestjs/swagger';

export class AuthUserResponseDto {
  @ApiProperty({ example: 'clx00000000000000000000000' })
  id!: string;

  @ApiProperty({ example: 'pm@deliveryops.local' })
  email!: string;

  @ApiProperty({ example: 'Demo PM' })
  name!: string;
}

export class LoginResponseDto {
  @ApiProperty({ type: AuthUserResponseDto })
  user!: AuthUserResponseDto;

  @ApiProperty({ example: 'Login successful' })
  message!: string;
}

export class LogoutResponseDto {
  @ApiProperty({ example: 'Logout successful' })
  message!: string;
}
