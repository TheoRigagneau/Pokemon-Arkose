import React, { useState, useEffect } from 'react'
import Header from '../components/Header.jsx'
import AuthModal from '../components/AuthModal.jsx'
import ChatView from '../components/ChatView.jsx'

export default function Forum({ user, setUser, showAuth, setShowAuth, authTab, setAuthTab, onLogout }) {
  const [channels, setChannels] = useState([])
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState("")
  const [newChannelDesc, setNewChannelDesc] = useState("")

  //récupère la liste des channels créés
  useEffect(() => {
    fetch('http://localhost:4000/api/channels')
      .then(r => r.json())
      .then(setChannels)
  }, [])

  //création du channel
  const createChannel = async () => {
    if (!newChannelName.trim()) return
    const response = await fetch('http://localhost:4000/api/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newChannelName, description: newChannelDesc, createdBy: user.pseudo })
    })

    const channel = await response.json()
    setChannels(prev => [...prev, channel])
    setNewChannelName("")
    setNewChannelDesc("")
    setShowCreateChannel(false)
  }

  const deleteChannel = async (channelId) => {
    await fetch(`http://localhost:4000/api/channels/${channelId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pseudo: user.pseudo })
    })
    setChannels(prev => prev.filter(c => c._id !== channelId))
  }

  return (
    // vérifie la connexion de l'utilisateur
    <div className="min-h-screen bg-[#fffdf7]">
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={(u) => { setUser(u); setShowAuth(false) }}
          initialTab={authTab}
        />
      )}

      {/* page pour créer le nouveau salon */}
      {showCreateChannel && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-[#fffdf7] border border-[#e0cc88] rounded w-[400px] p-6 flex flex-col gap-4">
            <h2 className="text-[#1a1408] font-bold tracking-widest">CRÉER UN SALON</h2>
            <div>
              <label className="text-[#8a6a28] text-xs tracking-widest">NOM</label>
              <input value={newChannelName} onChange={e => setNewChannelName(e.target.value)}
                className="w-full mt-1 border border-[#d8c090] rounded px-3 py-2 bg-[#fffdf7] text-sm focus:outline-none focus:border-[#c8900a]" />
            </div>
            <div>
              <label className="text-[#8a6a28] text-xs tracking-widest">DESCRIPTION</label>
              <input value={newChannelDesc} onChange={e => setNewChannelDesc(e.target.value)}
                className="w-full mt-1 border border-[#d8c090] rounded px-3 py-2 bg-[#fffdf7] text-sm focus:outline-none focus:border-[#c8900a]" />
            </div>
            <div className="flex gap-3">
              <button onClick={createChannel} className="flex-1 bg-[#c8900a] text-[#0d0a05] font-bold py-2 rounded hover:bg-[#e0a010]">
                Créer
              </button>
              <button onClick={() => setShowCreateChannel(false)} className="flex-1 bg-[#3a2a10] text-[#e8c060] font-bold py-2 rounded hover:bg-[#5a4010]">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <Header
        user={user}
        onLogout={onLogout}
        onAuthClick={(tab) => { setAuthTab(tab || "login"); setShowAuth(true) }}
      />

      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-[#1a1005] font-bold text-3xl tracking-widest mb-2">FORUM</h1>
        <div className="w-16 h-0.5 bg-[#c8900a] mb-8" />

        {/* affiche le chat du salon séléctionner en appelant chatview */}
        {selectedChannel && (
          <ChatView
            channelId={selectedChannel}
            //recherche le bon channel (général ou autre en fonction de son id)
            channelName={selectedChannel === "general" ? "Général" : channels.find(c => c._id === selectedChannel)?.name}
            user={user}
            onBack={() => setSelectedChannel(null)}
          />
        )}

      {/* page ou l'on voit tout les salons présent déja créer */}
        {!selectedChannel && (
          <>
            {user && (
              <button onClick={() => setShowCreateChannel(true)} className="mb-6 bg-[#c8900a] text-[#0d0a05] font-bold px-6 py-2 rounded hover:bg-[#e0a010]">
                + Créer un salon
              </button>
            )}

            <div onClick={() => setSelectedChannel("general")}
              className="border border-[#c8900a] rounded bg-[#fdf8ec] p-6 cursor-pointer hover:bg-[#fdf0cc] mb-4">
              <h2 className="text-[#1a1005] font-bold text-sm tracking-wide"># Général</h2>
              <p className="text-[#5a4a20] text-xs mt-1">Discussion générale sur le jeu</p>
            </div>

            <div className="flex flex-col gap-4">
              {channels.map(channel => (
                <div key={channel._id} onClick={() => setSelectedChannel(channel._id)}
                  className="border border-[#e0cc88] rounded bg-[#fdf8ec] p-6 cursor-pointer hover:border-[#c8900a]">
                  <h2 className="text-[#1a1005] font-bold text-sm tracking-wide"># {channel.name}</h2>
                  <p className="text-[#5a4a20] text-xs mt-1">{channel.description}</p>
                  {(user && (user.pseudo === channel.createdBy || user.role === 'modo')) && (
                    <button onClick={(e) => { e.stopPropagation(); deleteChannel(channel._id) }}
                      className="mt-2 text-red-500 text-xs hover:underline">
                      Supprimer
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}