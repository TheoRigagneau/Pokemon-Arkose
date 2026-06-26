import { useNavigate } from 'react-router-dom'

export default function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="bg-[#1a1408] border-t border-[#c8900a] py-8 px-6">
      <div className="max-w-5xl mx-auto flex items-center">
        
        <p className="text-[#e8c060] font-bold tracking-widest">© 2026 Pokémon Arkose</p>

        <div className="ml-auto flex gap-8">
          <p onClick={() => navigate("/mentions-legales")} className="text-[#5a4a20] text-xs cursor-pointer hover:text-[#c8a050]">Mentions légales</p>
          <p onClick={() => navigate("/contact")} className="text-[#7a5a20] text-xs cursor-pointer hover:text-[#c8a050]">Contact</p>
        </div>

      </div>
    </footer>
  )
}