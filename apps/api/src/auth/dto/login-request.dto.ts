import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class LoginRequestDto {
  @ApiProperty({ example: 'pm@deliveryops.local' })
  email!: string;

  @ApiProperty({ example: 'DeliveryOps123!', minLength: 8 })
  password!: string;
}

export function validateLoginRequest(body: LoginRequestDto): void {
  const messages: string[] = [];

  if (
    !body.email ||
    typeof body.email !== 'string' ||
    !EMAIL_PATTERN.test(body.email.trim())
  ) {
    messages.push('email must be an email');
  }

  if (
    !body.password ||
    typeof body.password !== 'string' ||
    body.password.length < 8
  ) {
    messages.push('password must be at least 8 characters');
  }

  if (messages.length > 0) {
    throw new BadRequestException(messages);
  }
}
