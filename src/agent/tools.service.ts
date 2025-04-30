import { Injectable } from '@nestjs/common';

@Injectable()
export class ToolsService {
  systemMessage(): string {
    return 'asd';
  }
}
