import { createTool } from "@convex-dev/agent";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { z } from "zod";
import { internal } from "../../../_generated/api";
import rag from "../rag";
import { query } from "../../../_generated/server";
import { supportAgent } from "../agents/supportAgent";
import { SEARCH_INTERPRETER_PROMPT } from "../constants";

export const search = createTool({
  description:
    "Search the knowledge base for relevant information to help answer user questions",
  args: z.object({
    query: z.string().describe("The search query to find relevant information"),
  }),
  handler: async (ctx, args) => {
    if (!ctx.threadId) {
      return "Missing thread ID";
    }
    // Getting the conversation via internalQuery because createTool is a wrapper over
    // useAction which does not allow DB interaction....
    const conversation = await ctx.runQuery(
      internal.system.conversations.getByThreadId,
      { threadId: ctx.threadId }
    );
    if (!conversation) {
      return "Conversation not found";
    }
    const orgId = conversation.organizationId;
    // Top 5 search results
    const searchResult = await rag.search(ctx, {
      namespace: orgId,
      query: args.query,
      limit: 5,
    });

    // Passing the context to the prompt for the LLM....
    const contextText = `Found results in ${searchResult.entries
      .map((e) => e.title || null)
      .filter((t) => t !== null)
      .join(",")}.Here is the context:\n\n ${searchResult.text}`;

    const response = await generateText({
      messages: [
        {
          role: "system",
          content: SEARCH_INTERPRETER_PROMPT,
        },
        {
          role: "user",
          content: `User asked: "${args.query}"\n\nSearch results: ${contextText} `,
        },
      ],
      model: google.chat("gemini-2.5-flash"),
    });

    await supportAgent.saveMessage(ctx, {
      threadId: ctx.threadId,
      message: {
        role: "assistant",
        content: response.text,
      },
    });

    return response.text;
  },
});
