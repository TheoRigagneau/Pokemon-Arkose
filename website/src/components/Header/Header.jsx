import { useState } from "react";


function Header() {
    return (<header
        className= "flex items-center justify-between px-6 h-24 bg-[#f5f0e8] border-b-2 border-[#c8900a] text-[20px]" >

            <div className="flex items-center gap-3 ">
                    <div className="bg-[#f5f0e8] rounded-full overflow-hidden h-24 w-24">
                    <img src="/Logo.png" alt="logo" className="h-full w-full object-cover" />
                    </div>
                    <a className="text-[#1a1408] font-bold tracking-widest text-sm text-[20px]">Pokemon Arkose</a>
            </div>

            <div className="text-[#1a1408] flex gap-10">   
                <a>Accueil</a>
                <a>Forum</a>
                <a>Jouer</a>
            </div>

            <div className="flex gap-7">
                <button className="bg-[#3a2a10] border-b-2 border-[#c8900a] text-[#e8c060] hover:bg-[#5a4010] px-4 py-2 rounded"> Se connecter</button>
                <button className="bg-[#c8900a] text-[#0d0a05] hover:bg-[#e0a010] px-4 py-2 rounded"> S'inscrire</button>
            </div>
    </header>)
}
export default Header;