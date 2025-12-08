"use client"

import type React from "react"

import { useEffect } from "react"

interface MobileFormModalProps {
  children: React.ReactNode
  onClose: () => void
}

export function MobileFormModal({ children, onClose }: MobileFormModalProps) {
  // スクロールロック
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">案件を投稿</h2>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700"
          aria-label="閉じる"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* フォーム */}
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </div>
  )
}
