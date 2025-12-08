"use client"

import { useEffect, useRef } from "react"
import type { UserAccount } from "../types"

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
  account: UserAccount
}

export default function AccountModal({ isOpen, onClose, account }: AccountModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div ref={modalRef} className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">アカウント情報</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="閉じる"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
              {account.type === "company" ? "法人" : "個人ドライバー"}
            </span>
            {account.verified && <span className="text-sm font-medium text-blue-600">認証済み</span>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">ニックネーム</label>
            <p className="mt-1 text-gray-900">{account.nickname}</p>
          </div>

          {account.type === "company" ? (
            <>
              <div>
                <label className="text-sm font-medium text-gray-600">会社名</label>
                <p className="mt-1 text-gray-900">{account.companyName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">代表者名</label>
                <p className="mt-1 text-gray-900">{account.representativeName}</p>
              </div>
              {account.driverCount && (
                <div>
                  <label className="text-sm font-medium text-gray-600">所属ドライバー数</label>
                  <p className="mt-1 text-gray-900">{account.driverCount}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium text-gray-600">名前</label>
                <p className="mt-1 text-gray-900">{account.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">年齢</label>
                <p className="mt-1 text-gray-900">{account.age}歳</p>
              </div>
            </>
          )}

          <div>
            <label className="text-sm font-medium text-gray-600">電話番号</label>
            <p className="mt-1 text-gray-900">{account.phoneNumber}</p>
          </div>

          {account.email && (
            <div>
              <label className="text-sm font-medium text-gray-600">メールアドレス</label>
              <p className="mt-1 text-gray-900">{account.email}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-gray-100 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-200"
        >
          閉じる
        </button>
      </div>
    </div>
  )
}
