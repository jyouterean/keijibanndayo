"use client"

import type React from "react"
import { useState } from "react"
import type { UserAccount } from "../types"

interface LoginFormProps {
  onLogin: (account: UserAccount) => void
  onSwitchToRegister: () => void
}

export default function LoginForm({ onLogin, onSwitchToRegister }: LoginFormProps) {
  const [formData, setFormData] = useState({
    phoneNumber: "",
    nickname: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loginError, setLoginError] = useState("")

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
    setLoginError("")
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "電話番号を入力してください"
    } else if (!/^[0-9-]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "正しい電話番号を入力してください"
    }

    if (!formData.nickname.trim()) {
      newErrors.nickname = "ニックネームを入力してください"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    // ローカルストレージから保存されたアカウントを取得して照合
    const storedAccountsStr = localStorage.getItem("keijiban_all_accounts")
    const storedAccounts: UserAccount[] = storedAccountsStr ? JSON.parse(storedAccountsStr) : []

    const matchedAccount = storedAccounts.find(
      (acc) => acc.phoneNumber === formData.phoneNumber.trim() && acc.nickname === formData.nickname.trim(),
    )

    if (matchedAccount) {
      onLogin(matchedAccount)
    } else {
      setLoginError("アカウントが見つかりません。電話番号とニックネームを確認してください。")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-800">ログイン</h1>
          <p className="text-gray-600">登録済みのアカウントでログイン</p>
        </div>

        {loginError && <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">{loginError}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="phoneNumber" className="mb-1 block text-sm font-medium text-gray-700">
              電話番号
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="例: 090-1234-5678"
              autoFocus
            />
            {errors.phoneNumber && <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>}
          </div>

          <div>
            <label htmlFor="nickname" className="mb-1 block text-sm font-medium text-gray-700">
              ニックネーム
            </label>
            <input
              type="text"
              id="nickname"
              value={formData.nickname}
              onChange={(e) => handleChange("nickname", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="登録時のニックネーム"
            />
            {errors.nickname && <p className="mt-1 text-xs text-red-600">{errors.nickname}</p>}
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            ログイン
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">アカウントをお持ちでない方は</p>
          <button
            onClick={onSwitchToRegister}
            className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            新規登録はこちら
          </button>
        </div>
      </div>
    </div>
  )
}
