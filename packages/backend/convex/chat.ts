import {
  Agent,
  listUIMessages,
  stepCountIs,
  syncStreams,
} from "@convex-dev/agent"
import { openai } from "@ai-sdk/openai"
import { paginationOptsValidator } from "convex/server"
import { v } from "convex/values"
import { components, internal } from "./_generated/api"
import { internalAction, mutation, query } from "./_generated/server"

const DEMO_USER_ID = "user_2tB16tFq2n8zQ4mGpH6s0XgF"

const catNamingAgent = new Agent(components.agent, {
  name: "Cat Naming Agent",
  languageModel: openai.chat("gpt-5.4-mini"),
  instructions:
    "You are a friendly cat naming agent. You are helping the user name their cat. The user will provide you with a description of the cat and you will need to come up with a name for the cat. Reply in plain sentences only: do not use markdown (no **bold**, headings with #, bullet lists with - or *, fenced code blocks, or backticks).",
  tools: {},
  stopWhen: stepCountIs(10),
})

export const createThread = mutation({
  args: {},
  handler: async (ctx) => {
    const { threadId } = await catNamingAgent.createThread(ctx, {
      userId: DEMO_USER_ID,
    })
    return threadId
  },
})

export const sendMessage = mutation({
  args: { prompt: v.string(), threadId: v.string() },
  handler: async (ctx, { prompt, threadId }) => {
    const { messageId } = await catNamingAgent.saveMessage(ctx, {
      threadId,
      prompt,
      userId: DEMO_USER_ID,
      skipEmbeddings: true,
    })
    await ctx.scheduler.runAfter(0, internal.chat.generateAgentResponse, {
      threadId,
      promptMessageId: messageId,
    })
  },
})

export const generateAgentResponse = internalAction({
  args: {
    threadId: v.string(),
    promptMessageId: v.string(),
  },
  handler: async (ctx, { threadId, promptMessageId }) => {
    const result = await catNamingAgent.streamText(
      ctx,
      { threadId },
      { promptMessageId },
      { saveStreamDeltas: { chunking: "word", throttleMs: 100 } },
    )
    await result.consumeStream()
  },
})

export const listThreadMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    // `useUIMessages(..., { stream: true })` supplies this; `vStreamArgs` can
    // disagree with some Convex TS versions, so we accept the runtime shape.
    streamArgs: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const streams = await syncStreams(ctx, components.agent, {
      threadId: args.threadId,
      streamArgs: args.streamArgs,
    })
    const paginated = await listUIMessages(ctx, components.agent, args)
    return { ...paginated, streams }
  },
})
