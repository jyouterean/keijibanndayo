"use client"

import type React from "react"
import { useState, useRef } from "react"
import type { Message } from "@/app/types"

interface AdminFormProps {
  nickname: string
  onSubmit: (message: Omit<Message, "id" | "timestamp">) => void
  type: "project" | "chat"
}

export function AdminForm({ nickname, onSubmit, type }: AdminFormProps) {
  const [content, setContent] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && !imagePreview) return

    onSubmit({
      type,
      nickname,
      content: content.trim(),
      imageUrl: imagePreview || undefined,
    })

    setContent("")
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" role="form" aria-label="管理者投稿フォーム">
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
        <span className="font-bold">管理者モード:</span> 自由にメッセージ・画像を投稿できます
      </div>

      <div>
        <label htmlFor="admin-content" className="block text-sm font-medium text-gray-700 mb-1">
          メッセージ
        </label>
        <textarea
          id="admin-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="メッセージを入力してください"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">画像</label>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
          id="admin-image-input"
        />
        <label
          htmlFor="admin-image-input"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-400 hover:bg-red-50 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm text-gray-600">画像を選択</span>
        </label>

        {imagePreview && (
          <div className="mt-3 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview || "/placeholder.svg"}
              alt="プレビュー"
              className="w-full max-h-48 object-contain rounded-lg border"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500 flex items-center gap-2">
        投稿者: <span className="font-medium">{nickname}</span>
        <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded">運営</span>
      </div>

      <button
        type="submit"
        disabled={!content.trim() && !imagePreview}
        className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
        aria-label="投稿する"
      >
        投稿する
      </button>
    </form>
  )
}
