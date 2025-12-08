"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { Message, ThreadComment } from "@/app/types"
import { useIsMobile } from "@/app/hooks/useMediaQuery"

interface ThreadModalProps {
  message: Message
  comments: ThreadComment[]
  onAddComment: (content: string) => void
  onClose: () => void
  nickname: string
}

export function ThreadModal({ message, comments, onAddComment, onClose, nickname }: ThreadModalProps) {
  const [content, setContent] = useState("")
  const commentsRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  // スクロールロック
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  // 新しいコメントで自動スクロール
  useEffect(() => {
    if (commentsRef.current) {
      commentsRef.current.scrollTop = commentsRef.current.scrollHeight
    }
  }, [comments])

  useEffect(() => {
    console.log("[v0] ThreadModal message.id:", message.id)
  }, [message.id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    if (!message.id) {
      console.error("[v0] Cannot add comment: message.id is undefined")
      return
    }
    onAddComment(content.trim())
    setContent("")
  }

  // 外側クリックで閉じる
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (isMobile) {
    // スマホ版: 全画面モーダル
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 truncate">{message.projectName}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 flex-shrink-0"
            aria-label="閉じる"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto" ref={commentsRef}>
          {/* 案件詳細 */}
          <div className="p-4 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">{message.nickname.charAt(0)}</span>
              </div>
              <span className="font-medium text-gray-900">{message.nickname}</span>
              <span className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleString("ja-JP")}</span>
            </div>
            <div className="space-y-2 text-sm">
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
              <div className="flex items-center gap-2 text-gray-700">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <a href={`tel:${message.phoneNumber}`} className="text-blue-600 hover:underline">
                  {message.phoneNumber}
                </a>
              </div>
              <p className="text-gray-700">{message.description}</p>
            </div>
          </div>

          {/* コメント一覧 */}
          <div className="p-4 space-y-3">
            {comments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">コメントはまだありません</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-900">{comment.nickname}</span>
                    <span className="text-xs text-gray-500">{new Date(comment.timestamp).toLocaleString("ja-JP")}</span>
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* コメント入力 */}
        <div className="border-t border-gray-200 p-3">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="コメントを入力..."
              rows={1}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <button
              type="submit"
              disabled={!content.trim()}
              className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex-shrink-0"
              aria-label="コメントを送信"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    )
  }

  // PC版: 中央モーダル
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={handleBackdropClick}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">{message.projectName}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            aria-label="閉じる"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 案件詳細 */}
        <div className="p-4 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium">{message.nickname.charAt(0)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">{message.nickname}</span>
              <p className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleString("ja-JP")}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {message.price}
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <a href={`tel:${message.phoneNumber}`} className="text-blue-600 hover:underline">
                {message.phoneNumber}
              </a>
            </div>
          </div>
          <p className="text-gray-700 mt-3">{message.description}</p>
        </div>

        {/* コメント一覧 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={commentsRef}>
          {comments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">コメントはまだありません</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-900">{comment.nickname}</span>
                  <span className="text-xs text-gray-500">{new Date(comment.timestamp).toLocaleString("ja-JP")}</span>
                </div>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))
          )}
        </div>

        {/* コメント入力 */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="コメントを入力..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button
              type="submit"
              disabled={!content.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              aria-label="コメントを投稿"
            >
              送信
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
