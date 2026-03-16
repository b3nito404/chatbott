import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { SendMessageDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) throw new Error('GEMINI_API_KEY manquant dans .env');
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  private getModel() {
    return this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT,  threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
      systemInstruction: `Tu es un assistant IA intelligent, précis et utile.
Tu réponds de manière claire, structurée et concise.
Tu utilises du markdown pour formater tes réponses quand c'est pertinent; et tu reponds selon 
la langue dans laquelle les questions te sont posées` ,
    });
  }

  async streamMessage(dto: SendMessageDto) {
    try {
      const history = (dto.history || []).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
      const result = await this.getModel().startChat({ history }).sendMessageStream(dto.message);
      return result.stream;
    } catch (err) {
      throw new InternalServerErrorException('Gemini error: ' + err.message);
    }
  }

  getHealth() {
    return { status: 'ok', model: 'gemini-2.5-flash', timestamp: new Date().toISOString() };
  }
}
