import { useState } from "react"
import { askAI } from "../services/ai"

export default function AIChat() {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")

  const handleAsk = async () => {
    const res = await askAI(question)
    setAnswer(res)
  }

  return (
    <div>
      <h2>AI Tutor</h2>
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <button onClick={handleAsk}>Ask</button>
      <p>{answer}</p>
    </div>
  )
}
