"use client"

import { useState, useEffect } from "react"
import { ChatBoard } from "./components/ChatBoard"
import { getAccount, setNickname as saveNickname, clearAccount } from "./utils/accountStorage"
import { fetchGuestNumber } from "@/lib/api"
import type { UserAccount } from "./types"

export default function Home() {
  const [nickname, setNicknameState] = useState<string | null>(null)
  const [account, setAccountState] = useState<UserAccount | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function initializeUser() {
      const storedAccount = getAccount()
      let storedNickname = localStorage.getItem("keijiban_nickname")

      if (!storedNickname) {
        const guestNumber = await fetchGuestNumber()
        storedNickname = `ゲスト${guestNumber}`
        saveNickname(storedNickname)
      }

      setNicknameState(storedNickname)
      setAccountState(storedAccount)
      setIsLoading(false)
    }

    initializeUser()
  }, [])

  const handleAccountUpdate = (newAccount: UserAccount) => {
    setAccountState(newAccount)
    setNicknameState(newAccount.nickname)
  }

  const handleLogout = async () => {
    const guestNumber = await fetchGuestNumber()
    const newGuestNickname = `ゲスト${guestNumber}`
    clearAccount()
    setAccountState(null)
    saveNickname(newGuestNickname)
    setNicknameState(newGuestNickname)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <>
      <div className="sr-only">
        <h1>軽貨物掲示板 - 全国の案件・求人情報が集まる無料掲示板</h1>
        <p>
          軽貨物掲示板は、軽貨物ドライバーと荷主・元請けをつなぐ日本最大級の無料掲示板プラットフォームです。全国の軽貨物配送案件、ドライバー求人情報、仕事探しに最適な情報が満載。軽貨物運送業界の情報交換やマッチングにご活用ください。
        </p>
        <h2>軽貨物掲示板の特徴</h2>
        <ul>
          <li>完全無料で利用可能な軽貨物案件掲示板</li>
          <li>全国の軽貨物ドライバー募集・求人情報を掲載</li>
          <li>荷主と軽貨物ドライバーのマッチング</li>
          <li>リアルタイムで軽貨物配送案件を投稿・検索</li>
          <li>軽貨物運送業界の情報交換コミュニティ</li>
        </ul>
        <h2>ご利用方法</h2>
        <p>
          ニックネームを登録するだけで、すぐに軽貨物案件の閲覧・投稿が可能です。アカウント登録すると認証マークが付与され、より信頼性の高い取引が可能になります。
        </p>
      </div>
      <ChatBoard
        nickname={nickname || "ゲスト"}
        onLogout={handleLogout}
        account={account || undefined}
        onAccountUpdate={handleAccountUpdate}
      />
    </>
  )
}
