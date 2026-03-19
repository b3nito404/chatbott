import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatService {
  private genAI: GoogleGenerativeAI;

  constructor(private config: ConfigService) {
    this.genAI = new GoogleGenerativeAI(
      this.config.get<string>('GEMINI_API_KEY') ?? '',
    );
  }


  async complete(prompt: string): Promise<string> {
    const model  = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  
  async *streamChat(
    message: string,
    history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
  ): AsyncGenerator<string> {
    const model  = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const chat   = model.startChat({ history });

    
     try {
    const result = await chat.sendMessageStream(message);
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield text;
    }
  } catch (err: any) {
    const errorString = JSON.stringify(err);

    if (errorString.includes('429') || errorString.includes('quota')) {
      yield 'Quota dépassé pour aujourd’hui. Veuillez réessayer plus tard.';
    } else {
      yield `Une erreur est survenue : ${errorString}`;
    }
  }
  }
}