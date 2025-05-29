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
    const tplId = await this.sessions.currentTemplate(phone);

    /* 2 ▸ dynamic system prompt + tools -------------------- */
    let system: string;
    let tools: OpenAI.Chat.ChatCompletionTool[];
    if (tplId) {
      let tplName = tplId;
      try {
        const res = await this.templates.findTemplateName(tplId);
        if (res.ok) tplName = res.data;
        else this.log.error(res.message);
      } catch (err) {
        this.log.error(`Template ${tplId} not found.`);
      }

      const step = (await this.steps.currentStep(tplId)) ?? 0;
      system = this.prompt.template_open_system_message(tplName, step);
      tools = this.prompt.template_open_tools();
    } else {
      system = this.prompt.template_closed_system_message();
      tools = this.prompt.template_closed_tools();
    }

    /* 3 ▸ assemble prompt */
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: system },
      ...history,
    ];

    /* 4 ▸ call OpenAI (stream) */
    const stream = await this.openai.chat(messages, model, tools);

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
    await this.conversation.store(uuid, stubMsg);

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
        /*────────── open_template ──────────*/
        case "open_template": {
          if (isOpenTemplateArgs(args)) {
            const { templateId } = args; // now type-safe
            await this.sessions.openTemplate(uuid, templateId);
            result = { status: "ok", opened: templateId };
          } else {
            result = { error: "templateName (string) is required." };
          }
          break;
        }
        /*────────── close_template ─────────*/
        case "close_template":
          await this.sessions.closeTemplate(uuid);
          result = { status: "ok", closed: true };
          break;
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
        /*────────── search_nodes ───────────*/
        case "search_nodes": {
          if (isSearchNodesArgs(args)) {
            result = searchNodes(args.type);
          } else {
            result = { error: "Missing or invalid { type: string }." };
          }
          break;
        }
        /*────────── show_all_nodes ─────────*/
        case "show_all_nodes": {
          result = showAllNodes();
          break;
        }
        /*────────── discovery ────────────────*/
        case "show_user_templates": {
          const res = await this.templates.showUserTemplates(userId);
          result = res.ok ? res.data : { error: res.message };
          break;
        }
        /*────────── template read / delete ──*/
        case "read_template": {
          if (!tplId) {
            result = { error: "no template open" };
            break;
          }
          const res = await this.templates.readTemplate(tplId);
          result = res.ok ? res.data : { error: res.message };
          break;
        }

        case "delete_template": {
          if (!tplId) {
            result = { error: "no template open" };
            break;
          }
          const res = await this.templates.deleteTemplate(tplId);
          if (res.ok) {
            await this.sessions.closeTemplate(uuid);
            result = { status: "ok", deleted: tplId };
          } else {
            result = { error: res.message };
          }
          break;
        }

        case "set_description": {
          if (!tplId) {
            result = { error: "no template open" };
            break;
          }
          if (!isSetDescriptionArgs(args)) {
            result = { error: "{ description:string } required" };
            break;
          }
          const res = await this.templates.setDescription(
            tplId,
            args.description,
          );
          result = res.ok ? { status: "ok" } : { error: res.message };
          break;
        }

        /*────────── file operations ─────────*/
        case "create_file": {
          if (!tplId) {
            result = { error: "no template open" };
            break;
          }
          if (!isCreateFileArgs(args)) {
            result = { error: "{ fileName, content } strings required" };
            break;
          }
          const res = await this.templates.createFile(
            tplId,
            args.fileName,
            args.content,
          );
          result = res.ok
            ? { status: "ok", created: args.fileName }
            : { error: res.message };
          break;
        }

        case "edit_file": {
          if (!tplId) {
            result = { error: "no template open" };
            break;
          }
          if (!isEditFileArgs(args)) {
            result = {
              error: "{ target_file, instructions, code_edit } required",
            };
            break;
          }
          const res = await this.templates.editFile(
            tplId,
            args.target_file,
            args.code_edit,
          );
          result = res.ok ? { status: "ok" } : { error: res.message };
          break;
        }

        case "delete_file": {
          if (!tplId) {
            result = { error: "no template open" };
            break;
          }
          if (!isFileNameArgs(args)) {
            result = { error: "{ fileName:string } required" };
            break;
          }
          const res = await this.templates.deleteFile(tplId, args.fileName);
          result = res.ok
            ? { status: "ok", deleted: args.fileName }
            : { error: res.message };
          break;
        }

        case "read_file": {
          if (!tplId) {
            result = { error: "no template open" };
            break;
          }
          if (!isFileNameArgs(args)) {
            result = { error: "{ fileName:string } required" };
            break;
          }
          const res = await this.templates.readFile(tplId, args.fileName);
          result = res.ok ? res.data : { error: res.message };
          break;
        }

        case "toggle_file": {
          if (!tplId) {
            result = { error: "no template open" };
            break;
          }
          if (!isFileNameArgs(args)) {
            result = { error: "{ fileName:string } required" };
            break;
          }
          const res = await this.templates.toggleFile(tplId, args.fileName);
          result = res.ok
            ? { status: "ok", active: res.data.active }
            : { error: res.message };
          break;
        }

        /*────────── create template ──────────────*/
        case "create_template": {
          if (!isCreateTemplateArgs(args)) {
            result = {
              error: "{ templateName:string, coreType:string } required",
            };
            break;
          }
          const res = await this.templates.createTemplate(
            userId,
            args.templateName,
          );
          if (res.ok) {
            const tplIdCreated = res.data.id;
            await this.sessions.openTemplate(uuid, tplIdCreated);
            const files: string[] = [];
            if (args.coreType === "defaultCore") {
              await this.templates.createFile(
                tplIdCreated,
                "ProgramCore.py",
                defaultCore,
              );
              await this.templates.createFile(
                tplIdCreated,
                "prompt.md",
                defaultCorePrompt,
              );
              files.push("ProgramCore.py", "prompt.md");
            }
            await this.templates.createFile(
              tplIdCreated,
              "pydsl-syntax.md",
              pyDslDocs,
            );
            await this.templates.createFile(
              tplIdCreated,
              "svg-syntax.md",
              svgDslDocs,
            );
            files.push("pydsl-syntax.md", "svg-syntax.md");
            await this.steps.setStep(tplIdCreated, 0);
            result =
              `Congratulations! You have just created the template ${tplIdCreated}. This template now contains the following files:\n` +
              files.map((f) => `* ${f}`).join("\n") +
              `\n\nTo ensure maximum user satisfaction with the final template, you will follow a structured development process. After completing each step, call the \`done_step(n)\` tool to receive further guidance. Begin by summarizing the user's clarified goals in a \`README.md\` file. When you've completed this step, call \`done_step(1)\`.`;
          } else {
            result = { error: res.message };
          }
          break;
        }

        case "done_step": {
          if (!tplId) {
            result = { error: "no template open" };
            break;
          }
          if (!isDoneStepArgs(args)) {
            result = { error: "{ step:number } required" };
            break;
          }
          const next = args.step + 1;
          await this.steps.setStep(tplId, next);
          result = doneStepMessage(args.step);
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
      await this.conversation.store(uuid, toolMsg);
    }

    /* 9 ▸ recurse so GPT can react to the tool output */
    yield* this.agentLoop(uuid, userId, model);
  }
}

/* ──────────────────────────────────────────────── */
/*  Local type-guard helpers                       */
/* ──────────────────────────────────────────────── */
function isOpenTemplateArgs(v: unknown): v is { templateId: string } {
  return (
    typeof v === "object" &&
    v !== null &&
    "templateId" in v &&
    typeof (v as Record<string, unknown>).templateId === "string"
  );
}

function isSearchArgs(v: unknown): v is { query: string } {
  return (
    typeof v === "object" &&
    v !== null &&
    "query" in v &&
    typeof (v as Record<string, unknown>).query === "string"
  );
}

function isSearchNodesArgs(v: unknown): v is { type: string } {
  return (
    typeof v === "object" &&
    v !== null &&
    "type" in v &&
    typeof (v as Record<string, unknown>).type === "string"
  );
}

function isFileNameArgs(v: unknown): v is { fileName: string } {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as any).fileName === "string"
  );
}

function isCreateFileArgs(
  v: unknown,
): v is { fileName: string; content: string } {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as any).fileName === "string" &&
    typeof (v as any).content === "string"
  );
}

function isCreateTemplateArgs(v: unknown): v is {
  templateName: string;
  coreType: string;
} {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as any).templateName === "string" &&
    typeof (v as any).coreType === "string"
  );
}

function isEditFileArgs(v: unknown): v is {
  target_file: string;
  instructions: string;
  code_edit: string;
} {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as any).target_file === "string" &&
    typeof (v as any).instructions === "string" &&
    typeof (v as any).code_edit === "string"
  );
}

function isSetDescriptionArgs(v: unknown): v is { description: string } {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as any).description === "string"
  );
}

function isDoneStepArgs(v: unknown): v is { step: number } {
  return (
    typeof v === "object" && v !== null && typeof (v as any).step === "number"
  );
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









import { Injectable } from '@nestjs/common';
import { ConversationService } from '../clientRedis/conversation.service';
import { PromptService } from '../agentHelp/prompt.service';
import { OpenAiService } from '../agentHelp/openai.service';
import OpenAI from 'openai';

@Injectable()
export class AgentService {
  constructor(
    private readonly conversation: ConversationService,
    private readonly prompt: PromptService,
    private readonly openai: OpenAiService,
  ) {}

  async send(phone: string, userMsg: string) {
    // 1) user message --> Redis
    await this.conversation.store(phone, userMsg);

    // 2) full history
    const history = await this.conversation.fetchAll(phone);

    // 3) convert --> OpenAI format
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    messages.push({
      role: 'system',
      content: this.prompt.systemMessage(),
    });

    for (const msg of history) {
      messages.push({
        role: msg.isAssistant ? 'assistant' : 'user',
        content: msg.message,
      });
    }
    // 4) call agent
    const reply = await this.agentLoop(messages, phone);

    // 5) assistant reply --> Redis
    await this.conversation.store(phone, reply);

    return reply;
  }

  async agentLoop(
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
    phone: string,
  ): Promise<string> {
    let turn: number = 0;
    console.log('\n-\n-\n-\n-');
    while (true) {
      turn += 1;
      const reply = await this.openai.chat(messages);

      messages.push({
        role: 'assistant',
        content: reply.content ?? '',
        tool_calls: reply.tool_calls,
      });

      console.log(
        ` - assistant turn ${turn}> \n`,
        JSON.stringify(reply, null, 2),
        '\n:\n:\n:\n:',
      );
      if (!reply.tool_calls) {
        return reply.content ?? '';
      }

      for (const call of reply.tool_calls) {
        const { name } = call.function;
        const args: unknown = JSON.parse(call.function.arguments);
        let result: unknown;

        if (name == 'set_user_plan') {
          const { week_day, plan } = args as {
            week_day: WeekDay;
            plan: string;
          };
          console.log('set_user_plan', week_day);
          await this.conversation.setPlanDay(userId, week_day, plan);
          result = 'ok';
        } else if (name == 'get_user_plan') {
          const { week_day } = args as { week_day: WeekDay };
          console.log('get_user_plan', week_day);
          result = await this.conversation.getPlanDay(userId, week_day);
        } else if (name == 'search_web') {
          const { query } = args as { query: string };
          console.log('search_web', query);
          result = await this.openai.search(query);
        } else {
          result = { error: `Tool ${name} not implemented` };
        }

        console.log(
          '\nrole: tool',
          `\ntool_call_id: ${call.id}`,
          `\ncontent: ${typeof result === 'string' ? result : JSON.stringify(result)}`,
        );

        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: typeof result === 'string' ? result : JSON.stringify(result),
        });
      }
    }
  }
}
