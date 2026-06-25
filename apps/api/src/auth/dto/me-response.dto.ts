import { ApiProperty } from '@nestjs/swagger';
import { AuthUserResponseDto } from './login-response.dto';

export class MeResponseDto {
  @ApiProperty({ type: AuthUserResponseDto })
  user!: AuthUserResponseDto;
}
