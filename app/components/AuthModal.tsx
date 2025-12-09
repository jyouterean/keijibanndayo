"use client"

import type React from "react"
import { useState } from "react"
import type { AccountType, UserAccount, CompanyAccount, DriverAccount } from "../types"
import { checkAdminLogin } from "../utils/accountStorage"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (account: UserAccount) => void
}

type AuthMode = "select" | "login" | "register"

export default function AuthModal({ isOpen, onClose, onComplete }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("select")
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
    password: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loginError, setLoginError] = useState("")

  if (!isOpen) return null

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

  const resetForm = () => {
    setFormData({
      nickname: "",
      companyName: "",
      representativeName: "",
      driverCount: "",
      name: "",
      age: "",
      phoneNumber: "",
      email: "",
      password: "",
    })
    setErrors({})
    setLoginError("")
    setAccountType(null)
  }

  const handleClose = () => {
    resetForm()
    setMode("select")
    onClose()
  }

  const validateLoginForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.phoneNumber.trim() && !formData.email.trim()) {
      newErrors.phoneNumber = "電話番号またはメールアドレスを入力してください"
    }
    if (!formData.nickname.trim() && !formData.password.trim()) {
      newErrors.nickname = "ニックネームまたはパスワードを入力してください"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateRegisterForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.nickname.trim()) {
      newErrors.nickname = "ニックネームを入力してください"
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "電話番号を入力してください"
    }
    if (accountType === "company") {
      if (!formData.companyName.trim()) newErrors.companyName = "会社名を入力してください"
      if (!formData.representativeName.trim()) newErrors.representativeName = "代表者名を入力してください"
    } else if (accountType === "driver") {
      if (!formData.name.trim()) newErrors.name = "名前を入力してください"
      if (!formData.age.trim()) newErrors.age = "年齢を入力してください"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateLoginForm()) return

    if (formData.email.trim() && formData.password.trim()) {
      const adminAccount = checkAdminLogin(formData.email.trim(), formData.password.trim())
      if (adminAccount) {
        onComplete(adminAccount)
        handleClose()
        return
      }
    }

    // 通常ユーザーログイン
    const storedAccountsStr = localStorage.getItem("keijiban_all_accounts")
    const storedAccounts: UserAccount[] = storedAccountsStr ? JSON.parse(storedAccountsStr) : []
    const matched = storedAccounts.find(
      (acc) =>
        acc.type !== "admin" &&
        (acc as CompanyAccount | DriverAccount).phoneNumber === formData.phoneNumber.trim() &&
        acc.nickname === formData.nickname.trim(),
    )

    if (matched) {
      onComplete(matched)
      handleClose()
    } else {
      setLoginError("アカウントが見つかりません")
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accountType || !validateRegisterForm()) return

    let account: UserAccount
    if (accountType === "company") {
      account = {
        type: "company",
        nickname: formData.nickname.trim(),
        companyName: formData.companyName.trim(),
        representativeName: formData.representativeName.trim(),
        driverCount: formData.driverCount.trim() || undefined,
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim() || undefined,
        verified: true,
      } as CompanyAccount
    } else {
      account = {
        type: "driver",
        nickname: formData.nickname.trim(),
        name: formData.name.trim(),
        age: formData.age.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim() || undefined,
        verified: true,
      } as DriverAccount
    }

    // Save to database via API
    try {
      await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account }),
      })
    } catch (error) {
      console.error("Error saving account to database:", error)
    }

    // アカウントリストに保存 (localStorage backup)
    const storedAccountsStr = localStorage.getItem("keijiban_all_accounts")
    const storedAccounts: UserAccount[] = storedAccountsStr ? JSON.parse(storedAccountsStr) : []
    const existingIndex = storedAccounts.findIndex((acc) => acc.phoneNumber === account.phoneNumber)
    if (existingIndex >= 0) {
      storedAccounts[existingIndex] = account
    } else {
      storedAccounts.push(account)
    }
    localStorage.setItem("keijiban_all_accounts", JSON.stringify(storedAccounts))

    onComplete(account)
    handleClose()
  }

  // 選択画面
  if (mode === "select") {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
        <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">アカウント</h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700" aria-label="閉じる">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-gray-600 text-sm mb-6">アカウントを作成すると認証マークが付き、信頼性が向上します。</p>

          <div className="space-y-3">
            <button
              onClick={() => setMode("login")}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              ログイン
            </button>
            <button
              onClick={() => setMode("register")}
              className="w-full py-3 px-4 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              新規登録
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ログイン画面
  if (mode === "login") {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
        <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => {
                resetForm()
                setMode("select")
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-gray-900">ログイン</h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700" aria-label="閉じる">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loginError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{loginError}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="090-1234-5678"
              />
              {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ニックネーム</label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => handleChange("nickname", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="登録時のニックネーム"
              />
              {errors.nickname && <p className="text-red-500 text-xs mt-1">{errors.nickname}</p>}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-400 mb-2">または</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="メールアドレス"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="パスワード"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              ログイン
            </button>
          </form>
        </div>
      </div>
    )
  }

  // 新規登録画面（タイプ選択）
  if (mode === "register" && !accountType) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
        <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => {
                resetForm()
                setMode("select")
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-gray-900">アカウント種別</h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700" aria-label="閉じる">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setAccountType("company")}
              className="w-full p-4 border-2 border-gray-200 rounded-lg text-left hover:border-blue-500 transition-colors"
            >
              <h3 className="font-semibold text-gray-900">法人</h3>
              <p className="text-sm text-gray-600">会社として登録する場合</p>
            </button>
            <button
              onClick={() => setAccountType("driver")}
              className="w-full p-4 border-2 border-gray-200 rounded-lg text-left hover:border-blue-500 transition-colors"
            >
              <h3 className="font-semibold text-gray-900">個人ドライバー</h3>
              <p className="text-sm text-gray-600">個人として登録する場合</p>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 新規登録フォーム
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setAccountType(null)} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-gray-900">
            {accountType === "company" ? "法人登録" : "ドライバー登録"}
          </h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700" aria-label="閉じる">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ニックネーム *</label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => handleChange("nickname", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            {errors.nickname && <p className="text-red-500 text-xs mt-1">{errors.nickname}</p>}
          </div>

          {accountType === "company" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">会社名 *</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">代表者名 *</label>
                <input
                  type="text"
                  value={formData.representativeName}
                  onChange={(e) => handleChange("representativeName", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                {errors.representativeName && <p className="text-red-500 text-xs mt-1">{errors.representativeName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">所属ドライバー数</label>
                <input
                  type="text"
                  value={formData.driverCount}
                  onChange={(e) => handleChange("driverCount", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="例: 10名"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">名前 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">年齢 *</label>
                <input
                  type="text"
                  value={formData.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">電話番号 *</label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="090-1234-5678"
            />
            {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            登録する
          </button>
        </form>
      </div>
    </div>
  )
}
