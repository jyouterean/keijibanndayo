"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getAccount, isAdmin } from "@/app/utils/accountStorage"

interface Account {
    id: string
    nickname: string
    phone: string | null
    email: string | null
    account_type: string
    company_name: string | null
    representative_name: string | null
    driver_count: string | null
    name: string | null
    age: string | null
    is_admin: boolean
    verified: boolean
    created_at: string
}

interface Message {
    id: string
    nickname: string
    content: string | null
    tab: string
    project_name: string | null
    phone: string | null
    price: string | null
    is_verified: boolean
    is_admin: boolean
    created_at: string
}

export default function AdminDashboard() {
    const router = useRouter()
    const [accounts, setAccounts] = useState<Account[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [activeTab, setActiveTab] = useState<"accounts" | "messages">("accounts")
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthorized, setIsAuthorized] = useState(false)

    useEffect(() => {
        const account = getAccount()
        if (!isAdmin(account)) {
            router.push("/")
            return
        }
        setIsAuthorized(true)
        loadData()
    }, [router])

    const loadData = async () => {
        try {
            const [accountsRes, messagesRes] = await Promise.all([
                fetch("/api/admin/accounts"),
                fetch("/api/admin/messages"),
            ])

            const accountsData = await accountsRes.json()
            const messagesData = await messagesRes.json()

            setAccounts(accountsData.accounts || [])
            setMessages(messagesData.messages || [])
        } catch (error) {
            console.error("Error loading data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const exportToCSV = (data: any[], filename: string) => {
        if (data.length === 0) return

        const headers = Object.keys(data[0])
        const csvContent = [
            headers.join(","),
            ...data.map((row) =>
                headers
                    .map((header) => {
                        const value = row[header]
                        if (value === null || value === undefined) return ""
                        const stringValue = String(value)
                        // Escape quotes and wrap in quotes if contains comma or newline
                        if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
                            return `"${stringValue.replace(/"/g, '""')}"`
                        }
                        return stringValue
                    })
                    .join(",")
            ),
        ].join("\n")

        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`
        link.click()
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-red-600 text-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold">管理者ダッシュボード</h1>
                    <button
                        onClick={() => router.push("/")}
                        className="text-sm bg-red-700 px-4 py-2 rounded hover:bg-red-800 transition-colors"
                    >
                        掲示板に戻る
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setActiveTab("accounts")}
                        className={`px-4 py-2 rounded-lg font-medium ${activeTab === "accounts"
                                ? "bg-red-600 text-white"
                                : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        アカウント ({accounts.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("messages")}
                        className={`px-4 py-2 rounded-lg font-medium ${activeTab === "messages"
                                ? "bg-red-600 text-white"
                                : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        メッセージ ({messages.length})
                    </button>
                </div>

                {/* Export Button */}
                <div className="mb-4">
                    <button
                        onClick={() =>
                            exportToCSV(
                                activeTab === "accounts" ? accounts : messages,
                                activeTab === "accounts" ? "accounts" : "messages"
                            )
                        }
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                        </svg>
                        CSVエクスポート
                    </button>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        {activeTab === "accounts" ? (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ニックネーム</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">種別</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">電話番号</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">メール</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">会社名/名前</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">登録日時</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {accounts.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                                アカウントデータがありません
                                            </td>
                                        </tr>
                                    ) : (
                                        accounts.map((account) => (
                                            <tr key={account.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        {account.nickname}
                                                        {account.is_admin && (
                                                            <span className="px-2 py-0.5 text-xs bg-red-600 text-white rounded">運営</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs rounded ${account.account_type === "company" ? "bg-blue-100 text-blue-800" :
                                                            account.account_type === "driver" ? "bg-green-100 text-green-800" :
                                                                "bg-red-100 text-red-800"
                                                        }`}>
                                                        {account.account_type === "company" ? "法人" :
                                                            account.account_type === "driver" ? "ドライバー" : "管理者"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                    {account.phone || "-"}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                    {account.email || "-"}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                    {account.company_name || account.name || "-"}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(account.created_at).toLocaleString("ja-JP")}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">投稿者</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">タブ</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">案件名</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">内容</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">電話番号</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">料金</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">投稿日時</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {messages.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                                メッセージデータがありません
                                            </td>
                                        </tr>
                                    ) : (
                                        messages.map((message) => (
                                            <tr key={message.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        {message.nickname}
                                                        {message.is_admin && (
                                                            <span className="px-2 py-0.5 text-xs bg-red-600 text-white rounded">運営</span>
                                                        )}
                                                        {message.is_verified && !message.is_admin && (
                                                            <span className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded">認証</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs rounded ${message.tab === "projects" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
                                                        }`}>
                                                        {message.tab === "projects" ? "案件" : "雑談"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                    {message.project_name || "-"}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                                                    {message.content || "-"}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                    {message.phone || "-"}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                    {message.price || "-"}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(message.created_at).toLocaleString("ja-JP")}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
