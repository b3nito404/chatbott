import { IsString, IsNotEmpty, IsArray, IsOptional, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class MessageDto {
  @IsEnum(['user', 'assistant']) role: 'user' | 'assistant';
  @IsString() @IsNotEmpty() content: string;
}
export class SendMessageDto {
  @IsString() @IsNotEmpty() message: string;
  @IsArray() @IsOptional() @ValidateNested({ each: true }) @Type(() => MessageDto) history?: MessageDto[];
  @IsString() @IsOptional() conversationId?: string;
}
