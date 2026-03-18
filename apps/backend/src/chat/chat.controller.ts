import { Controller, Post, Body, Get, Res, HttpCode } from '@nestjs/common';
import { Response } from 'express';
import { ChatService } from './chat.service';

class StreamDto {
  message: string;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
}

class CompleteDto {
  prompt: string;
}

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('health')
  health() {
    return { status: 'ok' };
  }


  @Post('complete')
  @HttpCode(200)
  async complete(@Body() body: CompleteDto) {
    const content = await this.chatService.complete(body.prompt);
    return { content };
  }
  @Post('stream')
  async stream(@Body() body: StreamDto, @Res() res: Response) {
    res.setHeader('Content-Type',  'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection',    'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();


    const history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> =
      (body.history ?? []).map((m) => ({
        role:  m.role === 'user' ? ('user' as const) : ('model' as const),
        parts: [{ text: m.content }],
      }));

    try {
      for await (const chunk of this.chatService.streamChat(body.message, history)) {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    } catch (err) {
      res.write(`data: ${JSON.stringify({ error: String(err) })}\n\n`);
    } finally {
      res.end();
    }
  }
}