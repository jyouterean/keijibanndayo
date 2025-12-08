"use client"

import { useEffect, useRef } from "react"
import type { Message, ThreadComment, UserAccount } from "@/app/types"
import { isAdmin } from "@/app/utils/accountStorage"

function VerifiedBadge() {
  return (
    <svg className="w-4 h-4 ml-1 flex-shrink-0" viewBox="0 0 24 24" fill="none" aria-label="認証済み">
      <circle cx="12" cy="12" r="10" fill="#3B82F6" />
      <path d="M8 12l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AdminBadge() {
  return <span className="ml-2 px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded">運営</span>
}

interface MessageListProps {
  messages: Message[]
  type: "project" | "chat"
  threadComments: Record<string, ThreadComment[]>
  onOpenThread?: (message: Message) => void
  account?: UserAccount | null
  onDeleteMessage?: (messageId: string) => void
  onBanUser?: (nickname: string) => void
  onMention?: (nickname: string) => void
}

export function MessageList({
  messages,
  type,
  threadComments,
  onOpenThread,
  account,
  onDeleteMessage,
  onBanUser,
  onMention,
}: MessageListProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const isAdminUser = isAdmin(account || null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  const filteredMessages = messages.filter((m) => m.type === type)

  if (filteredMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p>{type === "project" ? "案件がまだありません" : "メッセージがまだありません"}</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {filteredMessages.map((message) => {
        const commentCount = threadComments[message.id]?.length || 0
        const isAdminFreePost = message.isAdmin && !message.projectName && type === "project"

        return (
          <div
            key={message.id}
            className={`rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow ${message.isAdmin ? "bg-red-50 border-red-200" : "bg-white border-gray-100"
              }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center flex-wrap">
                <button
                  onClick={() => onMention?.(message.nickname)}
                  className={`font-medium hover:underline cursor-pointer ${message.isAdmin ? "text-red-700" : "text-gray-900"}`}
                  title={`@${message.nickname} をメンション`}
                >
                  {message.nickname}
                </button>
                {message.isAdmin && <AdminBadge />}
                {message.isVerified && !message.isAdmin && <VerifiedBadge />}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleString("ja-JP")}</span>
                {isAdminUser && !message.isAdmin && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => onDeleteMessage?.(message.id)}
                      className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      title="削除"
                    >
                      削除
                    </button>
                    <button
                      onClick={() => onBanUser?.(message.nickname)}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      title="BAN"
                    >
                      BAN
                    </button>
                  </div>
                )}
              </div>
            </div>

            {type === "project" && !isAdminFreePost ? (
              <div className="space-y-2">
                <h3 className={`font-bold text-lg ${message.isAdmin ? "text-red-800" : "text-gray-900"}`}>
                  {message.projectName}
                </h3>
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {message.price}
                </div>
                {message.description && <p className="text-gray-700">{message.description}</p>}
                {message.imageUrl && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={message.imageUrl || "/placeholder.svg"}
                      alt="投稿画像"
                      className="mt-2 max-w-full max-h-64 rounded-lg border object-contain"
                    />
                  </>
                )}
                {onOpenThread && (
                  <button
                    onClick={() => onOpenThread(message)}
                    className="mt-2 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    aria-label={`${message.projectName}のスレッドを見る`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2z"
                      />
                    </svg>
                    スレッドを見る {commentCount > 0 && `(${commentCount})`}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {message.content && (
                  <p className={`whitespace-pre-wrap ${message.isAdmin ? "text-red-800" : "text-gray-700"}`}>
                    {message.content}
                  </p>
                )}
                {message.imageUrl && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={message.imageUrl || "/placeholder.svg"}
                      alt="投稿画像"
                      className="mt-2 max-w-full max-h-64 rounded-lg border object-contain"
                    />
                  </>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
