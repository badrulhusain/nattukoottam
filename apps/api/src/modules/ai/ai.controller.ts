import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { AiService } from './ai.service';
import { Public } from '../../common/decorators/public.decorator';

export class AskCivicAssistantDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @IsString()
  district?: string;
}

export class TranslateTextDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  targetLang: 'en' | 'ml' | 'ta';
}

@ApiTags('AI Civic Assistant & Translation')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Public()
  @Post('ask')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ask AI Civic Assistant grounded in live ward issues, projects & conflicts',
  })
  @ApiResponse({ status: 200, description: 'Grounded civic response and references' })
  async ask(@Body() dto: AskCivicAssistantDto) {
    return this.aiService.askCivicAssistant(dto.question, dto.locality, dto.district);
  }

  @Public()
  @Post('translate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Translate community discussions (Malayalam ↔ English ↔ Tamil) via Groq LLM',
  })
  @ApiResponse({ status: 200, description: 'Accurately translated civic text' })
  async translate(@Body() dto: TranslateTextDto) {
    return this.aiService.translateText(dto.text, dto.targetLang);
  }
}

