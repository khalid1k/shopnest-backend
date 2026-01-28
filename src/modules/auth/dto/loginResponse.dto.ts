import { ApiProperty } from '@nestjs/swagger';

export class UserLoginResponseDto {
  @ApiProperty({
    example: 'b5c6e7d8-1234-4f3a-9a4c-abc123def456',
    description: 'Unique user ID',
  })
  id: string;

  @ApiProperty({
    example: 'Muhammad Khalid',
    description: 'Full name of the user',
  })
  fullName: string;

  @ApiProperty({
    example: 'khalid@example.com',
    description: 'Email address of the user',
  })
  email: string;

  @ApiProperty({
    example: 'eyhjlsiidfhdjksfjelfee...',
    description: 'accessToken that is used for authentication',
  })
  accessToken: string;
}
