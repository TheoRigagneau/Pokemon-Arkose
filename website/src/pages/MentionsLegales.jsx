import React from 'react'
import Header from '../components/Header.jsx'

export default function MentionsLegales({ user, setUser, showAuth, setShowAuth, authTab, setAuthTab, onLogout }) {
  return (
    <div className="min-h-screen bg-[#fffdf7]">
      <Header
        user={user}
        onLogout={onLogout}
        onAuthClick={(tab) => { setAuthTab(tab || "login"); setShowAuth(true) }}
      />
      <div className="max-w-2xl mx-auto py-12 px-6">
        <h1 className="text-[#1a1005] font-bold text-3xl tracking-widest mb-2">MENTIONS LÉGALES</h1>
        <div className="w-16 h-0.5 bg-[#c8900a] mb-8" />

        <div className="flex flex-col gap-6">

          <div className="border border-[#e0cc88] rounded bg-[#fdf8ec] p-6">
            <h2 className="text-[#1a1005] font-bold text-sm tracking-widest mb-3">ÉDITEUR</h2>
            <p className="text-[#5a4a20] text-sm">Pokémon Arkose est un projet fan-made non officiel, développé à titre personnel.</p>
            <p className="text-[#5a4a20] text-sm mt-2">Développeur : <span className="font-bold text-[#1a1408]">Théo RIGAGNEAU</span></p>
          </div>

          <div className="border border-[#e0cc88] rounded bg-[#fdf8ec] p-6">
            <h2 className="text-[#1a1005] font-bold text-sm tracking-widest mb-3">SPRITES</h2>
            <p className="text-[#5a4a20] text-sm">Les sprites utilisés dans ce jeu proviennent de <a href="https://www.spriters-resource.com" target="_blank" rel="noreferrer" className="text-[#c8900a] hover:underline">spriters-resource.com</a>.</p>
            <p className="text-[#5a4a20] text-sm mt-2">Ils appartiennent à leurs auteurs respectifs et à Nintendo / Game Freak.</p>
          </div>

          <div className="border border-[#e0cc88] rounded bg-[#fdf8ec] p-6">
            <h2 className="text-[#1a1005] font-bold text-sm tracking-widest mb-3">MUSIQUES</h2>
            <p className="text-[#5a4a20] text-sm">Les musiques utilisées dans ce jeu sont issues de la franchise Pokémon.</p>
            <p className="text-[#5a4a20] text-sm mt-2">Elles sont la propriété exclusive de <span className="font-bold text-[#1a1408]">Nintendo / Game Freak / The Pokémon Company</span> et sont protégées par le droit d'auteur.</p>
          </div>

          <div className="border border-[#c8900a] rounded bg-[#fdf0cc] p-6">
            <h2 className="text-[#1a1005] font-bold text-sm tracking-widest mb-3">⚠️ AVERTISSEMENT</h2>
            <p className="text-[#5a4a20] text-sm">En raison de l'utilisation de ressources protégées par le droit d'auteur, Pokémon Arkose est un projet strictement non commercial et ne pourra pas être distribué officiellement en l'état.</p>
            <p className="text-[#5a4a20] text-sm mt-2">Ce projet est réalisé dans un but personnel et éducatif, sans aucune intention de porter atteinte aux droits de Nintendo ou de ses partenaires.</p>
          </div>

        </div>
      </div>
    </div>
  )
}