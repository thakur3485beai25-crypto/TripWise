import { useEffect, useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import { INITIAL_MESSAGE, askTripAssistant } from "../utils/assistant";

export default function AssistantWidget({ open, onClose }) {
  const { places } = useApp();
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const question = input.trim();
    if (question === "" || sending) return;

    setMessages((prev) => [...prev, { sender: "user", text: question }]);
    setInput("");
    setSending(true);
    setMessages((prev) => [...prev, { sender: "loading", text: "Thinking..." }]);

    try {
      const reply = await askTripAssistant(question, places);
      setMessages((prev) => [...prev.filter((m) => m.sender !== "loading"), { sender: "bot", text: reply }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev.filter((m) => m.sender !== "loading"),
        { sender: "bot", text: "Something went wrong reaching the assistant. Please try again." },
      ]);
    }

    setSending(false);
  };

  return (
    <div className={`assistantPanel${open ? " open" : ""}`}>
      <div className="assistantHead">
        <span>TripWise Assistant</span>
        <button className="closeBtn" onClick={onClose}>
          ✕
        </button>
      </div>
      <div className="assistantMessages" ref={messagesRef}>
        {messages.map((m, i) => (
          <div key={i} className={`assistantMsg ${m.sender}`}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="assistantInputRow">
        <input
          type="text"
          placeholder="Describe the trip you want..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button disabled={sending} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}