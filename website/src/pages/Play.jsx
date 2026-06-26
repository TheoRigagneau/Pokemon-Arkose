import React from 'react'
import Header from '../components/Header.jsx'
import AuthModal from '../components/AuthModal.jsx'

export default function Play({ user, setUser, showAuth, setShowAuth, authTab, setAuthTab, onLogout }) {
  return (
    <div className="min-h-screen bg-[#fffdf7]">
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={(u) => { setUser(u); setShowAuth(false) }}
          initialTab={authTab}
        />
      )}

      {/* page dans laquel j'explique comment installer et lancer le jeu */}
      <Header
        user={user}
        onLogout={onLogout}
        onAuthClick={(tab) => { setAuthTab(tab || "login"); setShowAuth(true) }}
      />

      <div className="max-w-4xl mx-auto py-12 px-6 text-center">
        <p className="text-[#b89040] tracking-[5px] text-sm mb-4">· AVENTURE · EXPLORATION · COMBAT ·</p>
        <h1 className="text-[#1a1005] font-bold text-4xl tracking-widest mb-2">JOUER</h1>
        <div className="w-16 h-0.5 bg-[#c8900a] mx-auto mb-8" />

        <p className="text-[#5a4a20] text-sm max-w-xl mx-auto mb-10 leading-relaxed">
          Pokémon Arkose est un fan-game jouable sur PC. Télécharge le jeu, extrais le dossier et ouvre <span className="font-bold text-[#1a1408]">game.html</span> dans ton navigateur.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="border border-[#e0cc88] rounded bg-[#fdf8ec] p-6">
            <p className="text-2xl mb-3">1️⃣</p>
            <h3 className="text-[#1a1005] font-bold text-sm mb-2">Télécharger</h3>
            <p className="text-[#5a4a20] text-xs">Clique sur le bouton ci-dessous pour télécharger le jeu</p>
          </div>
          <div className="border border-[#e0cc88] rounded bg-[#fdf8ec] p-6">
            <p className="text-2xl mb-3">2️⃣</p>
            <h3 className="text-[#1a1005] font-bold text-sm mb-2">Extraire</h3>
            <p className="text-[#5a4a20] text-xs">Extrais le fichier ZIP dans un dossier de ton choix</p>
          </div>
          <div className="border border-[#e0cc88] rounded bg-[#fdf8ec] p-6">
            <p className="text-2xl mb-3">3️⃣</p>
            <h3 className="text-[#1a1005] font-bold text-sm mb-2">Jouer</h3>
            <p className="text-[#5a4a20] text-xs">Suis les instructions présentes dans le fichier <span className="font-bold text-[#1a1408]">README.md</span> inclus dans le dossier</p>
          </div>
        </div>

        {user ? (
          <a href="/game.zip" download>
            <button className="bg-[#c8900a] text-[#0d0a05] font-bold px-10 py-4 rounded hover:bg-[#e0a010] text-sm tracking-widest">
              TÉLÉCHARGER LE JEU
            </button>
          </a>
        ) : (
          <div>
            <p className="text-[#9a7a50] text-xs mb-4 italic">Tu dois être connecté pour télécharger le jeu</p>
            <button onClick={() => setShowAuth(true)} className="bg-[#c8900a] text-[#0d0a05] font-bold px-10 py-4 rounded hover:bg-[#e0a010] text-sm tracking-widest">
              SE CONNECTER
            </button>
          </div>
        )}
      </div>
    </div>
  )
}