"use client"

import type React from "react"

import { useState } from "react"
import type { Message } from "@/app/types"

interface ProjectFormProps {
  nickname: string
  onSubmit: (message: Omit<Message, "id" | "timestamp">) => void
}

export function ProjectForm({ nickname, onSubmit }: ProjectFormProps) {
  const [projectName, setProjectName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!projectName.trim()) {
      newErrors.projectName = "案件名を入力してください"
    }
    if (phoneNumber.trim() && !/^[0-9-]+$/.test(phoneNumber)) {
      newErrors.phoneNumber = "有効な電話番号を入力してください"
    }
    if (!price.trim()) {
      newErrors.price = "料金を入力してください"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    onSubmit({
      type: "project",
      nickname,
      content: "",
      projectName: projectName.trim(),
      phoneNumber: phoneNumber.trim(),
      price: price.trim(),
      description: description.trim(),
    })

    // フォームリセット
    setProjectName("")
    setPhoneNumber("")
    setPrice("")
    setDescription("")
    setErrors({})
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" role="form" aria-label="案件投稿フォーム">
      <div>
        <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
          案件名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="projectName"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="例: 都内配送案件"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        {errors.projectName && <p className="text-red-500 text-xs mt-1">{errors.projectName}</p>}
      </div>

      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
          電話番号
          <span className="text-gray-500 font-normal ml-1">(任意・スレッドで表示)</span>
        </label>
        <input
          type="tel"
          id="phoneNumber"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="例: 090-1234-5678"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
          料金 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="例: 15,000円/日"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          概要
          <span className="text-gray-500 font-normal ml-1">(任意)</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="案件の詳細を入力してください"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
        />
      </div>

      <div className="text-sm text-gray-500">
        投稿者: <span className="font-medium">{nickname}</span>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="案件を投稿"
      >
        投稿する
      </button>
    </form>
  )
}
