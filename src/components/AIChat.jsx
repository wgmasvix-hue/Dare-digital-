import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Send, Bot, User, Loader2, Sparkles, X } from "lucide-react"
import { geminiService } from "../services/geminiService"
import styles from "./AIChat.module.css"

export default function AIChat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'ai',
        text: "Mhoro! I'm DARA, your AI Tutor. How can I help you with your studies today?"
      }])
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (e) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', text: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role === 'user' ? 'user' : 'ai', text: m.text }))
      const response = await geminiService.chat(input.trim(), history)
      setMessages(prev => [...prev, { role: 'ai', text: response }])
    } catch (error) {
      console.error("AI Chat Error:", error)
      setMessages(prev => [...prev, { role: 'ai', text: "I'm sorry, I'm having trouble connecting. Please try again." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.chatContainer}>
      <AnimatePresence>
        {isOpen ? (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={styles.chatWindow}
          >
            <div className={styles.chatHeader}>
              <div className={styles.headerInfo}>
                <Bot size={20} />
                <span>DARA AI Tutor</span>
              </div>
              <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.messagesList}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.user : styles.ai}`}>
                  <div className={styles.messageIcon}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={styles.messageText}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className={`${styles.messageWrapper} ${styles.ai}`}>
                  <div className={styles.messageIcon}>
                    <Bot size={14} />
                  </div>
                  <div className={styles.messageText}>
                    <Loader2 size={14} className="animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className={styles.inputArea}>
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask DARA anything..."
                disabled={isLoading}
              />
              <button type="submit" disabled={!input.trim() || isLoading}>
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className={styles.chatTrigger}
          >
            <Sparkles size={24} />
            <span>Ask DARA</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
