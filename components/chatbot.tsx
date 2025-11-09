"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Upload, Loader2, AlertCircle, RotateCcw, Maximize2, Minimize2 } from "lucide-react"

interface Message {
  id: string
  type: "user" | "bot" | "error"
  content: string
  timestamp: Date
  fileName?: string
}

function renderFormattedContent(content: string) {
  const lines = content.split("\n")
  const elements: React.ReactNode[] = []
  let currentList: string[] = []

  lines.forEach((line, index) => {
    // Handle section headers
    if (line.startsWith("## ")) {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${index}`} className="list-disc list-inside mb-3 space-y-1">
            {currentList.map((item, i) => (
              <li key={i} className="text-sm">
                {item}
              </li>
            ))}
          </ul>,
        )
        currentList = []
      }
      elements.push(
        <h3 key={index} className="font-bold text-base mt-3 mb-2">
          {line.replace("## ", "")}
        </h3>,
      )
    }
    // Handle bullet points
    else if (line.startsWith("- ")) {
      currentList.push(line.replace("- ", ""))
    }
    // Handle bold text and regular paragraphs
    else if (line.trim()) {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${index}`} className="list-disc list-inside mb-3 space-y-1">
            {currentList.map((item, i) => (
              <li key={i} className="text-sm">
                {renderInlineFormatting(item)}
              </li>
            ))}
          </ul>,
        )
        currentList = []
      }
      elements.push(
        <p key={index} className="text-sm mb-2">
          {renderInlineFormatting(line)}
        </p>,
      )
    } else if (line.trim() === "" && currentList.length > 0) {
      elements.push(
        <ul key={`list-${index}`} className="list-disc list-inside mb-3 space-y-1">
          {currentList.map((item, i) => (
            <li key={i} className="text-sm">
              {renderInlineFormatting(item)}
            </li>
          ))}
        </ul>,
      )
      currentList = []
    }
  })

  // Handle remaining list items
  if (currentList.length > 0) {
    elements.push(
      <ul key="final-list" className="list-disc list-inside mb-3 space-y-1">
        {currentList.map((item, i) => (
          <li key={i} className="text-sm">
            {renderInlineFormatting(item)}
          </li>
        ))}
      </ul>,
    )
  }

  return elements
}

function renderInlineFormatting(text: string) {
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  const boldRegex = /\*\*(.*?)\*\*/g
  let match

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }
    parts.push(
      <strong key={match.index} className="font-semibold">
        {match[1]}
      </strong>,
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? parts : text
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        "Hello! I'm the BBDITM Resume Review Assistant. I can help you review your resume. Kindly upload your resume with the job description for the job you are applying for and I will review it and provide you with a detailed analysis of your resume.",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const nowMobile = window.innerWidth < 768 // 768px is typical tablet breakpoint
      setIsMobile((prevMobile) => {
        // Auto-maximize if switching to mobile while chat is open
        if (isOpen && nowMobile && !prevMobile) {
          setIsMaximized(true)
        }
        return nowMobile
      })
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [isOpen])

  // Auto-maximize on mobile when opening
  useEffect(() => {
    if (isOpen && isMobile) {
      setIsMaximized(true)
    } else if (!isOpen) {
      // Reset maximize state when closing (will be set again on mobile when reopening)
      setIsMaximized(false)
    }
  }, [isOpen, isMobile])

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 50)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() && !file) return

    setError(null)

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: file ? `[File: ${file.name}] ${input || "Please review my resume"}` : input,
      timestamp: new Date(),
      fileName: file?.name,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setFile(null)
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("message", input || "Please review my resume")
      if (file) {
        formData.append("file", file)
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const data = await response.json()

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: data.response || "I'm having trouble processing your request. Please try again.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "error",
        content: "Sorry, I encountered an error. Please try again or contact support.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      setError("Failed to send message. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (selectedFile.size > maxSize) {
        setError("File size must be less than 5MB")
        return
      }
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ]
      if (!allowedTypes.includes(selectedFile.type)) {
        setError("Only PDF, DOC, DOCX, and TXT files are supported")
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleRestart = () => {
    // Reset all state to initial values
    setMessages([
      {
        id: "1",
        type: "bot",
        content:
          "Hello! I'm the BBDITM Resume Review Assistant. I can help you review your resume. Kindly upload your resume with the job description for the job you are applying for and I will review it and provide you with a detailed analysis of your resume.",
        timestamp: new Date(),
      },
    ])
    setInput("")
    setFile(null)
    setError(null)
    setIsLoading(false)
    // Reset file input if it exists
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const quickQuestions = [
    "Tell me about B.Tech programs",
    "What are the admission requirements?",
    "How can I review my resume?",
    "What's the placement rate?",
  ]

  return (
    <>
      {/* Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition flex items-center justify-center z-40 ${
            isScrolled
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-white text-primary hover:bg-white/90"
          }`}
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bg-background border border-border shadow-2xl flex flex-col z-50 transition-all duration-300 ${
            isMaximized
              ? "inset-0 rounded-none"
              : "bottom-6 right-6 w-96 max-h-[600px] rounded-lg"
          }`}
        >
          {/* Header */}
          <div className={`bg-primary text-primary-foreground p-4 flex justify-between items-center shrink-0 ${isMaximized ? "rounded-none" : "rounded-t-lg"}`}>
            <div>
              <h3 className="font-bold">Resume Review Assistant</h3>
              <p className="text-xs text-primary-foreground/80">Powered by BBDITM</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRestart}
                className="p-1 hover:bg-primary/80 rounded transition"
                aria-label="Restart session"
                title="Restart session"
                disabled={isLoading}
              >
                <RotateCcw size={20} />
              </button>
              {!isMobile && (
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-1 hover:bg-primary/80 rounded transition"
                  aria-label={isMaximized ? "Minimize chat" : "Maximize chat"}
                  title={isMaximized ? "Minimize chat" : "Maximize chat"}
                >
                  {isMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
              )}
              <button
                onClick={() => {
                  setIsOpen(false)
                  setIsMaximized(false)
                }}
                className="p-1 hover:bg-primary/80 rounded transition"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isMaximized ? "max-h-[calc(100vh-200px)]" : ""}`}>
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`${isMaximized ? "max-w-2xl" : "max-w-xs"} px-4 py-2 rounded-lg ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : message.type === "error"
                        ? "bg-destructive/10 text-destructive border border-destructive/20 rounded-bl-none"
                        : "bg-card border border-border text-foreground rounded-bl-none"
                  }`}
                >
                  {message.type === "error" && <AlertCircle className="w-4 h-4 inline mr-2" />}
                  {message.type === "bot" ? (
                    <div className="text-sm space-y-1">{renderFormattedContent(message.content)}</div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card border border-border text-foreground px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex gap-2 items-center">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Processing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && !isLoading && (
            <div className="px-4 py-3 border-t border-border bg-card/50">
              <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
              <div className="space-y-2">
                {quickQuestions.map((question, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(question)
                    }}
                    className="w-full text-left text-xs px-2 py-1 rounded bg-background hover:bg-primary/10 text-foreground transition"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* File Upload Display */}
          {file && (
            <div className="px-4 py-2 bg-card border-t border-border flex items-center justify-between">
              <span className="text-sm text-foreground truncate">{file.name}</span>
              <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground transition">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20 flex items-center gap-2">
              <AlertCircle size={16} className="text-destructive shrink-0" />
              <span className="text-xs text-destructive">{error}</span>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-border p-4 space-y-3 shrink-0">
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="p-2 hover:bg-card rounded transition text-muted-foreground hover:text-foreground disabled:opacity-50"
                title="Upload resume"
              >
                <Upload size={20} />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
                placeholder="Ask about programs, resume review, or careers..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 bg-card border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || (!input.trim() && !file)}
                className="p-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Supported formats: PDF, DOC, DOCX, TXT (max 5MB)</p>
          </div>
        </div>
      )}
    </>
  )
}
