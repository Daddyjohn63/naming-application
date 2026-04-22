"use client"

import { api } from "@workspace/backend/_generated/api"
import {
  optimisticallySendMessage,
  useSmoothText,
  useUIMessages,
  type UIMessage,
} from "@convex-dev/agent/react"
import { cn } from "@workspace/ui/lib/utils"
import { useMutation } from "convex/react"
import { useState } from "react"

export default function AgentPage() {
  const createThread = useMutation(api.chat.createThread)
  const [threadId, setThreadId] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)

  async function handleNewThread() {
    setStarting(true)
    try {
      const id = await createThread()
      setThreadId(id)
    } finally {
      setStarting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col gap-4 p-4 pb-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Cat naming agent
        </h1>
        <p className="text-muted-foreground text-sm">
          Describe your cat and get name ideas. Start a thread, then chat below.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={starting}
          onClick={() => void handleNewThread()}
          className={cn(
            "rounded-lg bg-purple-700 px-4 py-2 text-sm font-medium text-white",
            "hover:bg-purple-800 disabled:opacity-50"
          )}
        >
          {starting ? "Starting…" : "New conversation"}
        </button>
        {threadId ? (
          <button
            type="button"
            onClick={() => setThreadId(null)}
            className="text-muted-foreground hover:text-foreground rounded-lg border px-4 py-2 text-sm"
          >
            Leave thread
          </button>
        ) : null}
      </div>

      {threadId ? (
        <ThreadChat threadId={threadId} />
      ) : (
        <p className="text-muted-foreground text-sm">
          No active thread. Choose <span className="font-medium">New conversation</span>{" "}
          to begin.
        </p>
      )}
    </main>
  )
}

function ThreadChat({ threadId }: { threadId: string }) {
  const {
    results: messages,
    status,
    loadMore,
  } = useUIMessages(
    api.chat.listThreadMessages,
    { threadId },
    { initialNumItems: 20, stream: true },
  )

  const sendMessage = useMutation(api.chat.sendMessage).withOptimisticUpdate(
    optimisticallySendMessage(api.chat.listThreadMessages),
  )

  const [draft, setDraft] = useState("")

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const prompt = draft.trim()
    if (!prompt) return
    setDraft("")
    void sendMessage({ threadId, prompt }).catch(() => setDraft(prompt))
  }

  const streaming = messages.some((m) => m.status === "streaming")

  return (
    <div className="flex min-h-[420px] flex-1 flex-col rounded-xl border bg-card shadow-sm">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {status !== "Exhausted" && messages.length > 0 && (
          <button
            type="button"
            disabled={status !== "CanLoadMore"}
            onClick={() => loadMore(10)}
            className="text-muted-foreground hover:text-foreground text-xs underline disabled:pointer-events-none disabled:opacity-40"
          >
            Load older messages
          </button>
        )}

        {messages.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Say hello and tell us about your cat.
          </p>
        ) : (
          messages.map((m) => <ChatBubble key={m.key} message={m} />)
        )}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2 border-t p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="e.g. Orange tabby, very shy, loves windowsills…"
          className="border-input bg-background focus-visible:ring-ring flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-2"
        />
        <button
          type="submit"
          disabled={!draft.trim() || streaming}
          className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-medium text-white hover:bg-purple-800 disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  )
}

function ChatBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user"
  const [visibleText] = useSmoothText(message.text, {
    startStreaming: message.status === "streaming",
  })

  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-purple-700 text-white"
            : "bg-muted text-foreground",
        )}
      >
        {visibleText || "…"}
      </div>
    </div>
  )
}
