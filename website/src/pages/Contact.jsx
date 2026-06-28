import React from 'react'
import Header from '../components/Header.jsx'

export default function Contact({ user, setUser, showAuth, setShowAuth, authTab, setAuthTab, onLogout }) {
  return (
    <div className="min-h-screen bg-[#fffdf7]">
      <Header
        user={user}
        onLogout={onLogout}
        onAuthClick={(tab) => { setAuthTab(tab || "login"); setShowAuth(true) }}
      />

      <div className="max-w-2xl mx-auto py-12 px-6">
        <h1 className="text-[#1a1005] font-bold text-3xl tracking-widest mb-2">CONTACT</h1>
        <div className="w-16 h-0.5 bg-[#c8900a] mb-8" />
        <div className="border border-[#e0cc88] rounded bg-[#fdf8ec] p-6 flex flex-col gap-4">
          <div>
            <p className="text-[#8a6a28] text-xs tracking-widest mb-1">EMAIL</p>
            <a href="mailto:ton_email@gmail.com" className="text-[#c8900a] hover:underline text-sm">
              pokemonarkose@gmail.com
            </a>

          </div>
          <div>
            <p className="text-[#8a6a28] text-xs tracking-widest mb-1">GITHUB</p>
            <a href="https://github.com/ton_pseudo" target="_blank" rel="noreferrer" className="text-[#c8900a] hover:underline text-sm">
              github.com/TheoRigagneau
            </a>

          </div>
        </div>
      </div>
    </div>
  )
}