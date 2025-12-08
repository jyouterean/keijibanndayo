"use client"

import type React from "react"

import { useState } from "react"

interface NicknameSetupProps {
  onComplete: (nickname: string) => void
}

export function NicknameSetup({ onComplete }: NicknameSetupProps) {
  const [nickname, setNickname] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = nickname.trim()
    if (!trimmed) {
      setError("ニックネームを入力してください")
      return
    }
    if (trimmed.length > 20) {
      setError("ニックネームは20文字以内で入力してください")
      return
    }
    onComplete(trimmed)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">軽貨物掲示板</h1>
          <p className="text-gray-600 mt-2">ニックネームを設定して始めましょう</p>
        </div>

        <form onSubmit={handleSubmit} role="form" aria-label="ニックネーム設定フォーム">
          <div className="mb-6">
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
              ニックネーム
            </label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value)
                setError("")
              }}
              placeholder="例: 配送太郎"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              maxLength={20}
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="ニックネームを設定して開始"
          >
            始める
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">ニックネームはブラウザに保存されます</p>
      </div>
    </div>
  )
}
