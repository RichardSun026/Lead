import { Controller, Get, Param } from "@nestjs/common";
import { ConversationService } from "./conversation.service";

@Controller("conversation")
export class ConversationController {
  //TODO: add validation
  constructor(private readonly conversation: ConversationService) {}
  @Get(":phone")
  getAll(@Param("phone") phone: string) {
    return this.conversation.fetchAll(phone);
  }
}
