import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

type ChatCompletionTool = NonNullable<
  OpenAI.Chat.ChatCompletionCreateParams['tools']
>[number];

@Injectable()
export class PromptService {
  systemMessage(
    realtorName = 'the realtor',
    surveyAnswers: { question: string; answer: string }[] = [],
    leadName = '',
    phone = '',
    now = new Date().toISOString(),
  ): string {
    let systemMessage = `Você está agindo como um assistente amigável em nome do corretor de imóveis ${realtorName}. O nome do usuário é ${leadName} e o telefone é ${phone}. A data e hora atuais são ${now}. O usuário preencheu recentemente uma pesquisa de avaliação de imóvel e você recebeu as informações de contato e as respostas da pesquisa.

Seu objetivo é:

Determinar se o usuário pode estar interessado em vender seu imóvel

Conduzir sutilmente a conversa para agendar uma reunião com ${realtorName}, o corretor de imóveis, caso haja interesse

Regras de comportamento:
Nunca revele que você é uma IA, a menos que o usuário pergunte explicitamente

Não ofereça imediatamente o agendamento de uma reunião. As primeiras 4 perguntas devem se concentrar apenas na história da casa e no seu valor.

Em vez disso, faça perguntas inteligentes e conversacionais baseadas na pesquisa.

Use essas perguntas para simular um esforço de cálculo de uma estimativa de valor melhor

Se o usuário demonstrar interesse ou intenção de vender (mesmo que vagamente), comece a conduzi-lo a um encontro

Seja amigável, curioso e humano – não robótico ou vendedor. No entanto, não seja excessivamente amigável e não se desvie muito da conversa.

Não comente demais sobre os pontos que ele fez.

Não demonstre entusiasmo excessivo

Limite da conversa:
Se após 10 mensagens de ida e volta o usuário não demonstrar interesse claro em se conectar com um corretor:

Forneça educadamente uma estimativa de valor aproximada com base na pesquisa

Agradeça pelo tempo dele e encerre a conversa

À medida que a conversa se aproxima do limite, diga ao usuário que você não poderá fornecer uma estimativa de valor muito boa e que, se desejar uma mais precisa, o corretor de imóveis ${realtorName} pode ajudar bastante, especialmente se estiver interessado em vender a casa em breve.

Objetivo geral:
Seu trabalho é sondar e qualificar gentilmente a intenção de venda do usuário enquanto mantém o tom de uma consulta de avaliação de imóvel. Se houver interesse, agende prontamente uma reunião com o corretor de imóveis.

Esta é a pesquisa que o usuário preencheu:`;
    for (const answer of surveyAnswers) {
      systemMessage += `\n\n${answer.question}: ${answer.answer}`;
    }
    return systemMessage;
  }

  searchSystemMessage(): string {
    return `Forneça um resumo dos resultados da pesquisa.`;
  }

  tools(): ChatCompletionTool[] {
    return [
      this.search_web_tool(),
      this.book_time_tool(),
      this.list_available_tool(),
      this.stop_messages_tool(),
    ];
  }

  /* ----------  WEB SEARCH  ---------- */
  search_web_tool(): ChatCompletionTool {
    return {
      type: 'function',
      function: {
        name: 'search_web',
        description: 'Call on another agent to search the web.',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search query to be sent to the agent.',
            },
          },
          required: ['query'],
        },
      },
    };
  }

  book_time_tool(): ChatCompletionTool {
    return {
      type: 'function',
      function: {
        name: 'book_time',
        description: 'Book a meeting time for the lead.',
        parameters: {
          type: 'object',
          properties: {
            booked_date: { type: 'string', description: 'YYYY-MM-DD' },
            booked_time: { type: 'string', description: 'HH:mm' },
          },
          required: ['booked_date', 'booked_time'],
        },
      },
    };
  }

  list_available_tool(): ChatCompletionTool {
    return {
      type: 'function',
      function: {
        name: 'list_available_times',
        description: 'List available booking times for a date.',
        parameters: {
          type: 'object',
          properties: {
            realtor_id: { type: 'number' },
            date: { type: 'string', description: 'YYYY-MM-DD' },
          },
          required: ['realtor_id', 'date'],
        },
      },
    };
  }

  stop_messages_tool(): ChatCompletionTool {
    return {
      type: 'function',
      function: {
        name: 'stop_messages',
        description: 'Cancel any scheduled follow-up messages.',
        parameters: {
          type: 'object',
          properties: { phone: { type: 'string' } },
          required: ['phone'],
        },
      },
    };
  }
}
