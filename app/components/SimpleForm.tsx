"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { Message } from "@/app/types"

interface SimpleFormProps {
  nickname: string
  onSubmit: (message: Omit<Message, "id" | "timestamp">) => void
  isBlocked: boolean
  blockCountdown: number | null
  mentionText?: string
  onMentionClear?: () => void
}

export function SimpleForm({
  nickname,
  onSubmit,
  isBlocked,
  blockCountdown,
  mentionText,
  onMentionClear,
}: SimpleFormProps) {
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" role="form" aria-label="雑談投稿フォーム">
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          メッセージ
        </label>
        <textarea
          id="content"
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="メッセージを入力してください"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          disabled={isBlocked}
        />
      </div>

      <div className="text-sm text-gray-500">
        投稿者: <span className="font-medium">{nickname}</span>
      </div>

      {isBlocked && blockCountdown !== null && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
          連投制限中です。あと {blockCountdown} 秒お待ちください。
        </div>
      )}

      <button
        type="submit"
        disabled={isBlocked || !content.trim()}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
        aria-label="メッセージを投稿"
      >
        投稿する
      </button>
    </form>
  )
}
