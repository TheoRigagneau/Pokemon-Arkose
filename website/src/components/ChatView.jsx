import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

const socket = io('http://localhost:4000')

export default function ChatView({ channelId, channelName, user, onBack }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const bottomRef = useRef(null)

  useEffect(() => {
    //récupère les anciens messages du salon
    fetch(`http://localhost:4000/api/channels/${channelId}/messages`)
      .then(r => r.json())
      .then(setMessages)

    socket.emit('joinChannel', channelId)

    socket.on('newMessage', (msg) => {
      setMessages(prev => [...prev, msg])
    })

    socket.on('messageDeleted', (messageId) => {
      setMessages(prev => prev.filter(m => m._id !== messageId))
    })

    return () => {
      socket.off('newMessage')
      socket.off('messageDeleted')
    }
  }, [channelId])

  //scroll du chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    //crée le message de l'utilisateur
    if (!input.trim() || !user) return
    socket.emit('sendMessage', {
      content: input,
      author: user.pseudo,
      channelId
    })
    setInput("")
  }

  const deleteMessage = async (messageId) => {
    await fetch(`http://localhost:4000/api/channels/${channelId}/messages/${messageId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pseudo: user.pseudo })
    })
    socket.emit('deleteMessage', { channelId, messageId })
    setMessages(prev => prev.filter(m => m._id !== messageId))
}


  const getColor = (name) => {
    //ajoute une couleur aléatoire au pseudos dans les salons pour chaque utilisateurs
    const colors = ['#e05555', '#d4a020', '#50a850', '#4080d0', '#9050d0', '#d05090', '#20a0a0']
    let hash = 0
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i)
    return colors[hash % colors.length]
    }

  return (
    //page du salon avec l'emplacement pour écrire le message et la possibilité de supprimer ses propres messages 
    //(sauf pour les modos)
    <div className="flex flex-col h-[70vh]">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={onBack} className="text-[#c8900a] hover:underline text-sm">← Retour</button>
        <h2 className="text-[#1a1005] font-bold tracking-wide"># {channelName}</h2>
      </div>

      <div className="flex-1 overflow-y-auto border border-[#e0cc88] rounded bg-white p-4 flex flex-col gap-2">
        {messages.map((msg, i) => (
            <div key={i} className="text-sm flex items-start justify-between group">
                <div>
                <span className="font-bold" style={{ color: getColor(msg.author) }}>{msg.author} </span>
                <span className="text-[#1a1005]">{msg.content}</span>
                </div>
                {user && (user.pseudo === msg.author || user.role === 'modo') && (
                <button onClick={() => deleteMessage(msg._id)}
                    className="text-red-400 text-xs opacity-0 group-hover:opacity-100 hover:text-red-600 ml-2 shrink-0">
                    ✕
                </button>
                )}
            </div>
            ))}
        <div ref={bottomRef} />
      </div>

      {user ? (
        <div className="flex gap-2 mt-3">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Écrire un message..."
            className="flex-1 border border-[#d8c090] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#c8900a]" />
          <button onClick={sendMessage}
            className="bg-[#c8900a] text-[#0d0a05] font-bold px-4 py-2 rounded hover:bg-[#e0a010]">
            Envoyer
          </button>
        </div>
      ) : (
        <p className="text-[#9a7a50] text-xs mt-3 text-center italic">Connecte-toi pour envoyer des messages</p>
      )}
    </div>
  )
}