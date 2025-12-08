"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { Message } from "@/app/types"

interface MobileSimpleFormProps {
  nickname: string
  onSubmit: (message: Omit<Message, "id" | "timestamp">) => void
  isBlocked: boolean
  blockCountdown: number | null
  mentionText?: string
  onMentionClear?: () => void
}

export function MobileSimpleForm({
  nickname,
  onSubmit,
  isBlocked,
  blockCountdown,
  mentionText,
  onMentionClear,
}: MobileSimpleFormProps) {
  const [content, setContent] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (mentionText) {
      setContent((prev) => {
        const newContent = prev ? `${prev} ${mentionText} ` : `${mentionText} `
        return newContent
      })
      textareaRef.current?.focus()
      onMentionClear?.()
    }
  }, [mentionText, onMentionClear])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isBlocked) return

    onSubmit({
      type: "chat",
      nickname,
      content: content.trim(),
    })

    setContent("")
  }

  return (
    <div className="bg-white border-t border-gray-200 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      {isBlocked && blockCountdown !== null && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-red-600 text-xs mb-2">
          連投制限中: あと {blockCountdown} 秒
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-end gap-2" role="form" aria-label="メッセージ入力">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="メッセージを入力..."
            rows={1}
            className="w-full px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
            disabled={isBlocked}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
        </div>
        <button
          type="submit"
          disabled={isBlocked || !content.trim()}
          className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex-shrink-0"
          aria-label="送信"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  )
}
