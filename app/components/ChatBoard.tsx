"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { Message, ThreadComment, TabType, RateLimitInfo, UserAccount } from "@/app/types"
import { MessageList } from "./MessageList"
import { ProjectForm } from "./ProjectForm"
import { SimpleForm } from "./SimpleForm"
import { MobileSimpleForm } from "./MobileSimpleForm"
import { MobileFormModal } from "./MobileFormModal"
import { ThreadModal } from "./ThreadModal"
import AccountModal from "./AccountModal"
import AuthModal from "./AuthModal"
import { AdminForm } from "./AdminForm"
import { clearNickname, setAccount, isAdmin } from "@/app/utils/accountStorage"
import {
  fetchMessages,
  postMessage,
  removeMessage,
  postThread,
  banUser,
  subscribeToMessages,
  subscribeToThreads,
  fetchAllThreads,
} from "@/lib/api"

import { useIsMobile } from "@/app/hooks/useMediaQuery"

const RATE_LIMIT_KEY = "keijiban_rate_limit"

// 連投制限の設定
const RATE_LIMIT_WINDOW = 30000 // 30秒
const RATE_LIMIT_MAX = 5 // 最大5件
const RATE_LIMIT_BLOCK_TIME = 60000 // 60秒ブロック

interface ChatBoardProps {
  nickname: string
  onLogout: () => void
  account?: UserAccount
  onAccountUpdate?: (account: UserAccount) => void
}

export function ChatBoard({ nickname, onLogout, account, onAccountUpdate }: ChatBoardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("project")
  const [messages, setMessages] = useState<Message[]>([])
  const [threadComments, setThreadComments] = useState<Record<string, ThreadComment[]>>({})
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showMobileForm, setShowMobileForm] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [rateLimitInfo, setRateLimitInfo] = useState<Record<TabType, RateLimitInfo>>({
    project: { timestamps: [], blockedUntil: null },
    chat: { timestamps: [], blockedUntil: null },
  })
  const [blockCountdown, setBlockCountdown] = useState<number | null>(null)
  const [mentionText, setMentionText] = useState<string>("")

  const chatScrollRef = useRef<HTMLDivElement>(null)
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false)
  const [hasNewMessage, setHasNewMessage] = useState(false)

  const isMobile = useIsMobile()
  const isAdminUser = isAdmin(account || null)

  useEffect(() => {
    const loadData = async () => {
      const [projectMessages, chatMessages, allThreads] = await Promise.all([
        fetchMessages("projects"),
        fetchMessages("chat"),
        fetchAllThreads(),
      ])

      setMessages([...projectMessages, ...chatMessages])

      // Group threads by message_id
      const groupedThreads: Record<string, ThreadComment[]> = {}
      allThreads.forEach((thread) => {
        if (!groupedThreads[thread.messageId]) {
          groupedThreads[thread.messageId] = []
        }
        groupedThreads[thread.messageId].push(thread)
      })
      setThreadComments(groupedThreads)
    }

    loadData()

    const unsubProjectMessages = subscribeToMessages("projects", (messages: Message[]) => {
      setMessages((prev) => {
        const chatMsgs = prev.filter(m => m.type === "chat")
        return [...chatMsgs, ...messages]
      })
    })

    const unsubChatMessages = subscribeToMessages("chat", (messages: Message[]) => {
      setMessages((prev) => {
        const projectMsgs = prev.filter(m => m.type === "project")
        return [...projectMsgs, ...messages]
      })
    })

    const storedRateLimit = localStorage.getItem(RATE_LIMIT_KEY)
    if (storedRateLimit) {
      setRateLimitInfo(JSON.parse(storedRateLimit))
    }

    return () => {
      unsubProjectMessages()
      unsubChatMessages()
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(rateLimitInfo))
  }, [rateLimitInfo])

  useEffect(() => {
    const blockedUntil = rateLimitInfo[activeTab].blockedUntil
    if (blockedUntil && blockedUntil > Date.now()) {
      const interval = setInterval(() => {
        const remaining = Math.ceil((blockedUntil - Date.now()) / 1000)
        if (remaining <= 0) {
          setBlockCountdown(null)
          setRateLimitInfo((prev) => ({
            ...prev,
            [activeTab]: { timestamps: [], blockedUntil: null },
          }))
        } else {
          setBlockCountdown(remaining)
        }
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setBlockCountdown(null)
    }
  }, [rateLimitInfo, activeTab])

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now()
    const info = rateLimitInfo[activeTab]

    if (info.blockedUntil && info.blockedUntil > now) {
      return false
    }

    const recentTimestamps = info.timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW)

    if (recentTimestamps.length >= RATE_LIMIT_MAX) {
      setRateLimitInfo((prev) => ({
        ...prev,
        [activeTab]: {
          timestamps: [],
          blockedUntil: now + RATE_LIMIT_BLOCK_TIME,
        },
      }))
      return false
    }

    return true
  }, [activeTab, rateLimitInfo])

  const addTimestamp = useCallback(() => {
    const now = Date.now()
    setRateLimitInfo((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        timestamps: [...prev[activeTab].timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW), now],
      },
    }))
  }, [activeTab])

  const handleAddMessage = async (message: Omit<Message, "id" | "timestamp">) => {
    if (activeTab === "chat" && !isAdminUser && !checkRateLimit()) {
      return
    }

    const messageData = {
      ...message,
      isVerified: account?.verified || false,
      isAdmin: isAdminUser,
    }

    await postMessage(messageData)

    if (activeTab === "chat" && !isAdminUser) {
      addTimestamp()
    }

    if (isMobile) {
      setShowMobileForm(false)
    }
  }

  const handleAddComment = async (messageId: string, content: string) => {
    if (!messageId) {
      console.error("[v0] Message ID is undefined")
      return
    }

    await postThread(messageId, nickname, content, undefined, account?.verified || false, isAdminUser)
  }

  const handleAuthComplete = (newAccount: UserAccount) => {
    setAccount(newAccount)
    if (onAccountUpdate) {
      onAccountUpdate(newAccount)
    }
  }

  const handleLogout = () => {
    clearNickname()
    onLogout()
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!isAdminUser) return
    await removeMessage(messageId)
    setMessages((prev) => prev.filter((m) => m.id !== messageId))
    // スレッドコメントも削除
    setThreadComments((prev) => {
      const newComments = { ...prev }
      delete newComments[messageId]
      return newComments
    })
  }

  const handleBanUser = async (userNickname: string) => {
    if (!isAdminUser) return
    if (window.confirm(`${userNickname}をBANしますか？`)) {
      await banUser("", userNickname, nickname, "管理者によるBAN")
      alert(`${userNickname}をBANしました`)
    }
  }

  const handleChatScroll = useCallback(() => {
    if (chatScrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatScrollRef.current
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      setIsUserScrolledUp(!isNearBottom)
      if (isNearBottom) {
        setHasNewMessage(false)
      }
    }
  }, [])

  const scrollToBottom = useCallback(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: "smooth",
      })
      setHasNewMessage(false)
      setIsUserScrolledUp(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === "chat" && messages.length > 0) {
      if (!isUserScrolledUp) {
        setTimeout(() => scrollToBottom(), 100)
      } else {
        setHasNewMessage(true)
      }
    }
  }, [messages.length, activeTab, isUserScrolledUp, scrollToBottom])

  const handleMention = useCallback(
    (targetNickname: string) => {
      if (activeTab === "chat") {
        setMentionText(`@${targetNickname}`)
      }
    },
    [activeTab],
  )

  const handleMentionClear = useCallback(() => {
    setMentionText("")
  }, [])

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('/delivery-truck-on-highway-at-sunset-with-city-skyl.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="fixed inset-0 bg-black/50 z-0" />

      <header
        className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200 relative z-10 flex-shrink-0"
        role="banner"
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">軽貨物掲示板</h1>
          <div className="flex items-center gap-4">
            {account ? (
              <button
                onClick={() => setShowAccountModal(true)}
                className="text-sm text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1"
              >
                <span className="font-medium">{nickname}</span>さん
                {isAdminUser ? (
                  <span className="ml-1 px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded">運営</span>
                ) : (
                  account.verified && <span className="text-xs text-blue-600 font-medium">(認証済み)</span>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  <span className="font-medium">{nickname}</span>さん
                </span>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  認証を取得
                </button>
              </div>
            )}
            {isAdminUser && (
              <a
                href="/admin"
                className="text-sm px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                管理画面
              </a>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="ログアウト"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 relative z-10 flex-shrink-0">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex gap-1" role="tablist" aria-label="チャットタブ">
            <button
              role="tab"
              aria-selected={activeTab === "project"}
              onClick={() => setActiveTab("project")}
              className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === "project" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              案件
              {activeTab === "project" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "chat"}
              onClick={() => setActiveTab("chat")}
              className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === "chat" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              雑談
              {activeTab === "chat" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
            </button>
          </nav>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto w-full flex relative z-10 overflow-hidden" role="main">
        {isMobile ? (
          <div className="flex-1 flex flex-col bg-white/90 backdrop-blur-sm overflow-hidden">
            <div
              ref={activeTab === "chat" ? chatScrollRef : undefined}
              onScroll={activeTab === "chat" ? handleChatScroll : undefined}
              className="flex-1 overflow-y-auto relative"
            >
              <MessageList
                messages={messages}
                type={activeTab}
                threadComments={threadComments}
                onOpenThread={activeTab === "project" ? setSelectedMessage : undefined}
                account={account}
                onDeleteMessage={handleDeleteMessage}
                onBanUser={handleBanUser}
                onMention={handleMention}
              />
            </div>
            {activeTab === "chat" && isUserScrolledUp && hasNewMessage && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-blue-700 transition-colors z-20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                新しいメッセージ
              </button>
            )}
            {activeTab === "chat" && (
              <div className="flex-shrink-0 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom,60px)]">
                {isAdminUser ? (
                  <div className="p-3">
                    <AdminForm nickname={nickname} onSubmit={handleAddMessage} type="chat" />
                  </div>
                ) : (
                  <MobileSimpleForm
                    nickname={nickname}
                    onSubmit={handleAddMessage}
                    isBlocked={blockCountdown !== null}
                    blockCountdown={blockCountdown}
                    mentionText={mentionText}
                    onMentionClear={handleMentionClear}
                  />
                )}
              </div>
            )}
            {activeTab === "project" && (
              <button
                onClick={() => setShowMobileForm(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors z-20"
                aria-label="新規案件を投稿"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex-1 flex flex-col border-r border-gray-200 bg-white/90 backdrop-blur-sm overflow-hidden relative">
              <div
                ref={activeTab === "chat" ? chatScrollRef : undefined}
                onScroll={activeTab === "chat" ? handleChatScroll : undefined}
                className="flex-1 overflow-y-auto"
              >
                <MessageList
                  messages={messages}
                  type={activeTab}
                  threadComments={threadComments}
                  onOpenThread={activeTab === "project" ? setSelectedMessage : undefined}
                  account={account}
                  onDeleteMessage={handleDeleteMessage}
                  onBanUser={handleBanUser}
                  onMention={handleMention}
                />
              </div>
              {activeTab === "chat" && isUserScrolledUp && hasNewMessage && (
                <button
                  onClick={scrollToBottom}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-blue-700 transition-colors z-20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  新しいメッセージ
                </button>
              )}
            </div>
            <div className="w-96 bg-white/90 backdrop-blur-sm flex flex-col flex-shrink-0 overflow-hidden">
              <div className="p-4 flex-1 overflow-y-auto">
                <h2 className="font-bold text-gray-900 mb-4">
                  {activeTab === "project" ? "案件を投稿" : "メッセージを投稿"}
                </h2>
                {isAdminUser ? (
                  <AdminForm nickname={nickname} onSubmit={handleAddMessage} type={activeTab} />
                ) : activeTab === "project" ? (
                  <ProjectForm nickname={nickname} onSubmit={handleAddMessage} />
                ) : (
                  <SimpleForm
                    nickname={nickname}
                    onSubmit={handleAddMessage}
                    isBlocked={blockCountdown !== null}
                    blockCountdown={blockCountdown}
                    mentionText={mentionText}
                    onMentionClear={handleMentionClear}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {showMobileForm && activeTab === "project" && (
        <MobileFormModal onClose={() => setShowMobileForm(false)}>
          {isAdminUser ? (
            <AdminForm nickname={nickname} onSubmit={handleAddMessage} type="project" />
          ) : (
            <ProjectForm nickname={nickname} onSubmit={handleAddMessage} />
          )}
        </MobileFormModal>
      )}

      {selectedMessage && (
        <ThreadModal
          message={selectedMessage}
          comments={threadComments[selectedMessage.id] || []}
          onAddComment={(content) => handleAddComment(selectedMessage.id, content)}
          onClose={() => setSelectedMessage(null)}
          nickname={nickname}
        />
      )}

      {account && (
        <AccountModal isOpen={showAccountModal} onClose={() => setShowAccountModal(false)} account={account} />
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onComplete={handleAuthComplete} />
    </div>
  )
}
