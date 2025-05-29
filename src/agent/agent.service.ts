// src/agent/agent.service.ts
// -------------------------------------------------
import { Injectable, Logger } from "@nestjs/common";
import { ConversationService } from "../clientRedis/conversation.service";
import { PromptService } from "../agentHelp/prompt.service";
import { OpenAiService } from "../agentHelp/openai.service";
import OpenAI from "openai";
import { ChatCompletionMessageToolCall } from "openai/resources/chat/completions";

@Injectable()
export class AgentService {
  private readonly log = new Logger("Agent");
  constructor(
    private readonly conversation: ConversationService,
    private readonly prompt: PromptService,
    private readonly openai: OpenAiService,
  ) {}

  /*───────────────────────────────────────────────────────────*/
  /*  PUBLIC: entry streamed to the client                     */
  /*───────────────────────────────────────────────────────────*/
  async send(phone: string, userMsg: string, model = "gpt-4o-mini") {
    /* 1 ─ save user turn */
    await this.conversation.store(phone, {
      role: "user",
      content: userMsg,
    });

    /* 2 ─ delegate all further work */
    return this.agentLoop(phone, model);
  }

  /*───────────────────────────────────────────────────────────*/
  /*  INTERNAL LOOP                                           */
  /*───────────────────────────────────────────────────────────*/
  private async agentLoop(
    phone: string,
    model: string,
  ): Promise<string> {
    /* 1 ▸ history + session flag */
    const history = await this.conversation.fetchAll(phone);

    /* 2 ▸ dynamic system prompt + tools -------------------- */
    const system: string = this.prompt.systemMessage();

    /* 3 ▸ assemble prompt */
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: system },
      ...history,
    ];

    /* 4 ▸ call OpenAI (stream) */
    const response = await this.openai.chat(messages, model);

    let assistantText = "";
    interface ToolCallDelta {
      index: number;
      id?: string;
      type?: "function";
      function?: { name?: string; arguments?: string };
    }
    const builders: Record<number, ToolCallDelta> = {};
    const completedCalls: ChatCompletionMessageToolCall[] = [];

    for await (const chunk of stream) {
      const delta = chunk.choices[0].delta;

      /* plain tokens → client & buffer */
      if (delta.content) {
        assistantText += delta.content;
        yield delta.content;
      }

      /* collect tool-call deltas */
      if (delta.tool_calls) {
        for (const frag of delta.tool_calls as unknown as ToolCallDelta[]) {
          const i = frag.index;
          if (!builders[i]) builders[i] = { index: i, function: {} };

          // deep-merge incremental fields
          Object.assign(builders[i], frag, {
            function: {
              ...builders[i].function,
              ...frag.function,
              arguments:
                (builders[i].function?.arguments ?? "") +
                (frag.function?.arguments ?? ""),
            },
          });

          // finished when we have id + name + *parsable* args
          const b = builders[i];
          if (
            b.id &&
            b.type &&
            b.function?.name &&
            isJson(b.function?.arguments ?? "")
          ) {
            // ⇢ after the guard `b.function.arguments` is definitely a string,
            //    but TS still thinks it might be undefined.
            const argStr = b.function.arguments as string; // ← satisfy the type checker

            completedCalls[i] = {
              id: b.id,
              type: b.type,
              function: {
                name: b.function.name,
                arguments: argStr, // now typed as string
              },
            };

            this.log.debug(
              `► tool_call #${i} completed → ${b.function.name}  args=${argStr}`,
            );

            delete builders[i];
            yield JSON.stringify(completedCalls[i]);
          }
        }
      }
    }

    /* 5 ▸ store assistant natural-language reply */
    const assistantMsg: OpenAI.Chat.ChatCompletionMessageParam = {
      role: "assistant",
      content: assistantText,
    };
    await this.conversation.store(uuid, assistantMsg);

    const calls = completedCalls.filter(Boolean);

    /* 6 ▸ no tool calls? we’re done */
    if (calls.length === 0) return;

    /* 7 ▸ store assistant stub containing the FULL calls  */
    const stubMsg: OpenAI.Chat.ChatCompletionMessageParam = {
      role: "assistant",
      tool_calls: calls,
    };
    await this.conversation.store(phone, stubMsg);

    /* 8 ▸ execute every call & store its result ----------- */
    for (const call of calls) {
      const { name } = call.function;
      const argsRaw = call.function.arguments ?? "{}";
      let args: unknown;
      try {
        args = JSON.parse(argsRaw);
      } catch {
        console.error("Error parsing JSON:", argsRaw);
        args = {}; // never throw on bad JSON
      }
      let result: unknown;

      switch (name) {
        /*────────── search_web ─────────────*/
        case "search_web": {
          // quick inline validation – no separate helper needed
          if (isSearchArgs(args)) {
            const { query } = args as { query: string };
            result = await this.openai.search(query); // returns summary string
          } else {
            result = { error: "Missing or invalid { query: string }." };
          }
          break;
        }

        /*────────── default / TODO ─────────*/
        default:
          result = { error: `Tool ${name} not implemented` };
      }
      /* store tool result */
      const toolMsg: OpenAI.Chat.ChatCompletionMessageParam = {
        role: "tool",
        tool_call_id: call.id,
        content: typeof result === "string" ? result : JSON.stringify(result),
      };
      await this.conversation.store(phone, toolMsg);
    }

    /* 9 ▸ recurse so GPT can react to the tool output */
    return this.agentLoop(phone, model);
  }
}
function isJson(s: string): boolean {
  if (s.length === 0) return false; // empty = definitely not finished
  try {
    JSON.parse(s);
    return true;
  } catch {
    return false;
  }
}