"use client"

import type React from "react"

import { useState } from "react"
import type { AccountType, UserAccount, CompanyAccount, DriverAccount } from "../types"

interface AccountFormProps {
  onComplete: (account: UserAccount) => void
  onSwitchToLogin: () => void
}

export default function AccountForm({ onComplete, onSwitchToLogin }: AccountFormProps) {
  const [accountType, setAccountType] = useState<AccountType | null>(null)
  const [formData, setFormData] = useState({
    nickname: "",
    companyName: "",
    representativeName: "",
    driverCount: "",
    name: "",
    age: "",
    phoneNumber: "",
    email: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nickname.trim()) {
      newErrors.nickname = "ニックネームを入力してください"
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "電話番号を入力してください"
    } else if (!/^[0-9-]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "正しい電話番号を入力してください"
    }

    if (accountType === "company") {
      if (!formData.companyName.trim()) {
        newErrors.companyName = "会社名を入力してください"
      }
      if (!formData.representativeName.trim()) {
        newErrors.representativeName = "代表者名を入力してください"
      }
    } else if (accountType === "driver") {
      if (!formData.name.trim()) {
        newErrors.name = "名前を入力してください"
      }
      if (!formData.age.trim()) {
        newErrors.age = "年齢を入力してください"
      } else if (!/^\d+$/.test(formData.age)) {
        newErrors.age = "正しい年齢を入力してください"
      }
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "正しいメールアドレスを入力してください"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!accountType) return
    if (!validateForm()) return

    if (accountType === "company") {
      const account: CompanyAccount = {
        type: "company",
        nickname: formData.nickname.trim(),
        companyName: formData.companyName.trim(),
        representativeName: formData.representativeName.trim(),
        driverCount: formData.driverCount.trim() || undefined,
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim() || undefined,
        verified: true,
      }
      saveAccountToList(account)
      onComplete(account)
    } else {
      const account: DriverAccount = {
        type: "driver",
        nickname: formData.nickname.trim(),
        name: formData.name.trim(),
        age: formData.age.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim() || undefined,
        verified: true,
      }
      saveAccountToList(account)
      onComplete(account)
    }
  }

  const saveAccountToList = (account: UserAccount) => {
    const storedAccountsStr = localStorage.getItem("keijiban_all_accounts")
    const storedAccounts: UserAccount[] = storedAccountsStr ? JSON.parse(storedAccountsStr) : []
    const existingIndex = storedAccounts.findIndex((acc) => acc.phoneNumber === account.phoneNumber)
    if (existingIndex >= 0) {
      storedAccounts[existingIndex] = account
    } else {
      storedAccounts.push(account)
    }
    localStorage.setItem("keijiban_all_accounts", JSON.stringify(storedAccounts))
  }

  if (!accountType) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-800">アカウント作成</h1>
            <p className="text-gray-600">アカウントタイプを選択してください</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setAccountType("company")}
              className="w-full rounded-lg border-2 border-indigo-200 bg-white p-6 text-left transition-all hover:border-indigo-500 hover:shadow-md"
            >
              <h3 className="mb-2 text-lg font-semibold text-gray-800">法人</h3>
              <p className="text-sm text-gray-600">会社として登録する場合</p>
            </button>

            <button
              onClick={() => setAccountType("driver")}
              className="w-full rounded-lg border-2 border-indigo-200 bg-white p-6 text-left transition-all hover:border-indigo-500 hover:shadow-md"
            >
              <h3 className="mb-2 text-lg font-semibold text-gray-800">個人ドライバー</h3>
              <p className="text-sm text-gray-600">個人として登録する場合</p>
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">すでにアカウントをお持ちの方は</p>
            <button
              onClick={onSwitchToLogin}
              className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              ログインはこちら
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-800">
            {accountType === "company" ? "法人アカウント作成" : "個人ドライバーアカウント作成"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ニックネーム */}
          <div>
            <label htmlFor="nickname" className="mb-1 block text-sm font-medium text-gray-700">
              ニックネーム (必須)
            </label>
            <input
              type="text"
              id="nickname"
              value={formData.nickname}
              onChange={(e) => handleChange("nickname", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="ニックネームを入力"
            />
            {errors.nickname && <p className="mt-1 text-xs text-red-600">{errors.nickname}</p>}
          </div>

          {accountType === "company" ? (
            <>
              {/* 会社名 */}
              <div>
                <label htmlFor="companyName" className="mb-1 block text-sm font-medium text-gray-700">
                  会社名 (必須)
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="例: 株式会社〇〇"
                />
                {errors.companyName && <p className="mt-1 text-xs text-red-600">{errors.companyName}</p>}
              </div>

              {/* 代表者名 */}
              <div>
                <label htmlFor="representativeName" className="mb-1 block text-sm font-medium text-gray-700">
                  代表者名 (必須)
                </label>
                <input
                  type="text"
                  id="representativeName"
                  value={formData.representativeName}
                  onChange={(e) => handleChange("representativeName", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="例: 山田太郎"
                />
                {errors.representativeName && <p className="mt-1 text-xs text-red-600">{errors.representativeName}</p>}
              </div>

              {/* 所属ドライバー数 */}
              <div>
                <label htmlFor="driverCount" className="mb-1 block text-sm font-medium text-gray-700">
                  所属ドライバー数 (任意)
                </label>
                <input
                  type="text"
                  id="driverCount"
                  value={formData.driverCount}
                  onChange={(e) => handleChange("driverCount", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="例: 10名"
                />
              </div>
            </>
          ) : (
            <>
              {/* 名前 */}
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                  名前 (必須)
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="例: 山田太郎"
                />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              {/* 年齢 */}
              <div>
                <label htmlFor="age" className="mb-1 block text-sm font-medium text-gray-700">
                  年齢 (必須)
                </label>
                <input
                  type="text"
                  id="age"
                  value={formData.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="例: 30"
                />
                {errors.age && <p className="mt-1 text-xs text-red-600">{errors.age}</p>}
              </div>
            </>
          )}

          {/* 電話番号 */}
          <div>
            <label htmlFor="phoneNumber" className="mb-1 block text-sm font-medium text-gray-700">
              電話番号 (必須)
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="例: 090-1234-5678"
            />
            {errors.phoneNumber && <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>}
          </div>

          {/* メールアドレス */}
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              メールアドレス (任意)
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="例: example@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAccountType(null)}
              className="flex-1 rounded-lg bg-gray-200 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-300"
            >
              戻る
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              作成
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
