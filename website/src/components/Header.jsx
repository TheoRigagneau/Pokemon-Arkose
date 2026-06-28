import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Header({ onAuthClick, user, onLogout }) {
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)

    let boutonsDesktop
    if (user) {
        boutonsDesktop = (
            <>
                <span className="text-[#c8900a] font-bold text-sm">{user.pseudo}</span>
                <button onClick={onLogout} className="bg-[#3a2a10] border border-[#c8900a] text-[#e8c060] hover:bg-[#5a4010] px-4 py-2 rounded text-sm">
                    Se déconnecter
                </button>
            </>
        )
    } else {
        boutonsDesktop = (
            <>
                <button onClick={() => onAuthClick("login")} className="bg-[#3a2a10] border-b-2 border-[#c8900a] text-[#e8c060] hover:bg-[#5a4010] px-4 py-2 rounded text-sm">Se connecter</button>
                <button onClick={() => onAuthClick("register")} className="bg-[#c8900a] text-[#0d0a05] hover:bg-[#e0a010] px-4 py-2 rounded text-sm">S'inscrire</button>
            </>
        )
    }

    let boutonsMobile
    if (user) {
        boutonsMobile = (
            <>
                <span className="text-[#c8900a] font-bold text-sm">{user.pseudo}</span>
                <button onClick={() => { onLogout(); setMenuOpen(false) }} className="bg-[#3a2a10] border border-[#c8900a] text-[#e8c060] px-4 py-2 rounded text-sm">
                    Se déconnecter
                </button>
            </>
        )
    } else {
        boutonsMobile = (
            <>
                <button onClick={() => { onAuthClick("login"); setMenuOpen(false) }} className="bg-[#3a2a10] border-b-2 border-[#c8900a] text-[#e8c060] px-4 py-2 rounded text-sm">Se connecter</button>
                <button onClick={() => { onAuthClick("register"); setMenuOpen(false) }} className="bg-[#c8900a] text-[#0d0a05] px-4 py-2 rounded text-sm">S'inscrire</button>
            </>
        )
    }

    return (
        //header de la page principale avec le responsif
        <header className="bg-[#f5f0e8] border-b-2 border-[#c8900a]">
            <div className="flex items-center justify-between px-6 h-20">
                
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
                    <div className="bg-[#f5f0e8] rounded-full overflow-hidden h-16 w-16">
                        <img src="/Logo.png" alt="logo" className="h-full w-full object-cover" />
                    </div>
                    <span className="text-[#1a1408] font-bold tracking-widest text-sm hidden sm:block">Pokemon Arkose</span>
                </div>

                <div className="hidden md:flex text-[#1a1408] gap-10">
                    <a onClick={() => navigate("/")} className="cursor-pointer hover:text-[#c8900a] transition-colors">Accueil</a>
                    <a onClick={() => navigate("/forum")} className="cursor-pointer hover:text-[#c8900a] transition-colors">Forum</a>
                    <a onClick={() => navigate("/play")} className="cursor-pointer hover:text-[#c8900a] transition-colors">Jouer</a>
                </div>

                <div className="hidden md:flex gap-7 items-center">
                    {boutonsDesktop}
                </div>

                <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col gap-1.5 p-2">
                    <span className="w-6 h-0.5 bg-[#1a1408] block"></span>
                    <span className="w-6 h-0.5 bg-[#1a1408] block"></span>
                    <span className="w-6 h-0.5 bg-[#1a1408] block"></span>
                </button>
            </div>

            {menuOpen && (
                <div className="md:hidden bg-[#f5f0e8] border-t border-[#e0cc88] px-6 py-4 flex flex-col gap-4">
                    <a onClick={() => { navigate("/"); setMenuOpen(false) }} className="cursor-pointer text-[#1a1408] hover:text-[#c8900a]">Accueil</a>
                    <a onClick={() => { navigate("/forum"); setMenuOpen(false) }} className="cursor-pointer text-[#1a1408] hover:text-[#c8900a]">Forum</a>
                    <a onClick={() => { !user && onAuthClick(); setMenuOpen(false) }} className="cursor-pointer text-[#1a1408] hover:text-[#c8900a]">Jouer</a>
                    <div className="flex flex-col gap-3 pt-2 border-t border-[#e0cc88]">
                        {boutonsMobile}
                    </div>
                </div>
            )}
        </header>
    )
}