import './App.css';
import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

function Header({ onAuthClick, user, onLogout }) {
    return (<header className="flex items-center justify-between px-6 h-24 bg-[#f5f0e8] border-b-2 border-[#c8900a] text-[20px]">

        <div className="flex items-center gap-3">
            <div className="bg-[#f5f0e8] rounded-full overflow-hidden h-24 w-24">
                <img src="/Logo.png" alt="logo" className="h-full w-full object-cover" />
            </div>
            <a className="text-[#1a1408] font-bold tracking-widest text-sm text-[20px]">Pokemon Arkose</a>
        </div>

        <div className="text-[#1a1408] flex gap-10">   
            <a>Accueil</a>
            <a onClick={() => !user && onAuthClick()} className="cursor-pointer">Forum</a>
            <a onClick={() => !user && onAuthClick()} className="cursor-pointer">Jouer</a>
        </div>

        <div className="flex gap-7 items-center">
            {user ? (
                <>
                    <span className="text-[#c8900a] font-bold text-sm">{user.pseudo}</span>
                    <button onClick={onLogout} className="bg-[#3a2a10] border border-[#c8900a] text-[#e8c060] hover:bg-[#5a4010] px-4 py-2 rounded text-sm">
                        Se déconnecter
                    </button>
                </>
            ) : (
                <>
                    <button onClick={onAuthClick} className="bg-[#3a2a10] border-b-2 border-[#c8900a] text-[#e8c060] hover:bg-[#5a4010] px-4 py-2 rounded">Se connecter</button>
                    <button onClick={() => onAuthClick ("register")} className="bg-[#c8900a] text-[#0d0a05] hover:bg-[#e0a010] px-4 py-2 rounded">S'inscrire</button>
                </>
            )}
        </div>
    </header>)
}

function Hero({onAuthClick, user }) {
  return (
    <section className="bg-[#fffdf7] text-center py-16">
      <p className="text-[#b89040] tracking-[5px] text-sm mb-4">· ORIGINE · TEMPS · ESPACE ·</p>
      <h1 className="text-[#1a1005] font-bold text-6xl tracking-widest">POKEMON</h1>
      <h2 className="text-[#c8900a] font-bold text-6xl tracking-widest">ARKOSE</h2>
      <p className="text-[#5a4a20] mt-6 max-w-xl mx-auto text-sm">
        Un fan-game Pokémon jouable dans le navigateur
      </p>
      <button onClick={() => !user ? onAuthClick() : console.log("télécharger")}>
        Télécharger le jeu
      </button>
    </section>
  )
}

function Slider() {
  const [current, setCurrent] = useState(0)
  
  const images = [
    { src: "/screenshots/screen1.png", alt: "Screenshot 1" },
    { src: "/screenshots/screen2.png", alt: "Screenshot 2" },
    { src: "/screenshots/screen3.png", alt: "Screenshot 3" },
  ]

  const prev = () => setCurrent((current - 1 + images.length) % images.length)
  const next = () => setCurrent((current + 1) % images.length)

  return (
    <section className="bg-[#fffdf7] py-12 px-6">
      <h2 className="text-center text-[#1a1005] font-bold text-2xl tracking-widest mb-8">
        APERÇU DU JEU
      </h2>
      <div className="relative max-w-3xl mx-auto">
        <div className="bg-[#1a1408] h-64 rounded flex items-center justify-center border border-[#c8900a]">
          <p className="text-[#c8a050] italic text-sm">[ Screenshot à venir ]</p>
        </div>
        <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 bg-[#3a2a10] border border-[#c8900a] text-[#e8c060] px-3 py-2 rounded hover:bg-[#5a4010]">
          ←
        </button>
        <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 bg-[#3a2a10] border border-[#c8900a] text-[#e8c060] px-3 py-2 rounded hover:bg-[#5a4010]">
          →
        </button>
        <div className="flex justify-center gap-2 mt-4">
          {images.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full ${i === current ? 'bg-[#c8900a]' : 'bg-[#d8c090]'}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function Quote() {
  return (
    <section className="bg-[#1a1408] py-12 px-6 text-center">
      <p className="text-[#e8c060] font-['Georgia'] italic text-lg max-w-2xl mx-auto leading-relaxed">
        "Au commencement, il n'y avait que le néant. Puis l'Œuf vibra, et Arceus façonna le temps, l'espace et l'antimatière pour donner naissance au monde."
      </p>
      <p className="text-[#c8900a] text-sm mt-4 tracking-widest">
        — Tablette I, Sanctuaire de la Genèse
      </p>
    </section>
  )
}

function News() {
  const articles = [
    {
      date: "07 Mai 2026",
      title: "Lancement de la Beta",
      description: "La première version jouable de Pokémon Arkose est disponible ! Explorez Boscalis et partez à l'aventure."
    },
    {
      date: "15 Avril 2026", 
      title: "Système de combat",
      description: "Le système de combat tour par tour est maintenant implémenté avec les vraies stats des Pokémon."
    },
    {
      date: "01 Mars 2026",
      title: "Début du projet",
      description: "Pokémon Arkose est officiellement lancé ! Une nouvelle aventure fan-made vous attend."
    }
  ]

  return (
    <section className="bg-[#fffdf7] py-12 px-6">
      <h2 className="text-center text-[#1a1005] font-bold text-2xl tracking-widest mb-2">
        DERNIÈRES NOUVELLES
      </h2>
      <div className="w-16 h-0.5 bg-[#c8900a] mx-auto mb-8" />
      
      <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6">
        {articles.map((article, i) => (
          <div key={i} className="border border-[#e0cc88] rounded bg-[#fdf8ec] p-6">
            <p className="text-[#c8900a] text-xs tracking-widest mb-2">{article.date}</p>
            <h3 className="text-[#1a1005] font-bold text-sm mb-3 tracking-wide">{article.title}</h3>
            <p className="text-[#5a4a20] text-xs leading-relaxed">{article.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-[#1a1408] border-t border-[#c8900a] py-8 px-6">
      <div className="max-w-5xl mx-auto flex items-center">
        
        <p className="text-[#e8c060] font-bold tracking-widest">© 2026 Pokémon Arkose</p>

        <div className="ml-auto flex gap-8">
          <p className="text-[#5a4a20] text-xs cursor-pointer hover:text-[#c8a050]">Mentions légales</p>
          <p className="text-[#7a5a20] text-xs cursor-pointer hover:text-[#c8a050]">Contact</p>
        </div>

      </div>
    </footer>
  )
}

function AuthModal({ onClose, onLogin, initialTab = "login" }) {
  const [tab, setTab] = useState(initialTab)
  const [pseudo, setPseudo] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    console.log("handleSubmit appelé", { email, password })
    setError("")

    if (tab === "forgot") {
      const response = await fetch("http://localhost:4000/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
      })
      setError("")
      setTab("login")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        setError("Email invalide")
        return
    }

    if (password.length < 8) {
        setError("Le mot de passe doit faire au moins 8 caractères")
        return
    }


    const url = tab === "login"
      ? "http://localhost:4000/api/auth/login"
      : "http://localhost:4000/api/auth/register"
    
    const body = tab === "login"
      ? { email, password }
      : { pseudo, email, password }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    if (!response.ok) { setError(data.error); return }
    onLogin({ pseudo: data.pseudo, token: data.token })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#fffdf7] border border-[#e0cc88] rounded w-[480px]">
        
        <div className="bg-[#1a1408] rounded-t flex items-center justify-between px-6 py-3">
          <h2 className="text-[#e8c060] font-bold tracking-widest text-sm">
              {tab === "login" ? "CONNEXION" : tab === "register" ? "INSCRIPTION" : "MOT DE PASSE OUBLIÉ"}
          </h2>
          <button onClick={onClose} className="text-[#7a5a20] hover:text-[#c8a050] text-xl">×</button>
        </div>

        <div className="flex border-b border-[#e0cc88]">
          <button onClick={() => setTab("login")}
            className={`flex-1 py-3 text-sm font-bold tracking-wide ${tab === "login" ? "text-[#1a1005] border-b-2 border-[#c8900a]" : "text-[#9a7a38]"}`}>
            Connexion
          </button>
          <button onClick={() => setTab("register")}
            className={`flex-1 py-3 text-sm font-bold tracking-wide ${tab === "register" ? "text-[#1a1005] border-b-2 border-[#c8900a]" : "text-[#9a7a38]"}`}>
            S'inscrire
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="bg-[#fdf0cc] border border-[#e0c060] rounded px-4 py-2 text-[#7a5010] text-xs text-center">
            Un compte est requis pour télécharger et jouer.
          </div>

          {tab === "register" && (
            <div>
              <label className="text-[#8a6a28] text-xs tracking-widest">PSEUDO</label>
              <input value={pseudo} onChange={e => setPseudo(e.target.value)} className="w-full mt-1 border border-[#d8c090] rounded px-3 py-2 bg-[#fffdf7] text-sm focus:outline-none focus:border-[#c8900a]" />
            </div>
          )}

          {tab !== "forgot" && (
            <div>
              <label className="text-[#8a6a28] text-xs tracking-widest">EMAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mt-1 border border-[#d8c090] rounded px-3 py-2 bg-[#fffdf7] text-sm focus:outline-none focus:border-[#c8900a]" />
            </div>
          )}

          {tab !== "forgot" && (
            <div>
              <label className="text-[#8a6a28] text-xs tracking-widest">MOT DE PASSE</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full mt-1 border border-[#d8c090] rounded px-3 py-2 bg-[#fffdf7] text-sm focus:outline-none focus:border-[#c8900a]" />
            </div>
          )}

          {/* Formulaire mot de passe oublié */}
          {tab === "forgot" && (
            <div>
              <p className="text-[#5a4a20] text-xs mb-3">Entre ton email pour recevoir un lien de réinitialisation.</p>
              <label className="text-[#8a6a28] text-xs tracking-widest">EMAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mt-1 border border-[#d8c090] rounded px-3 py-2 bg-[#fffdf7] text-sm focus:outline-none focus:border-[#c8900a]" />
              <p onClick={() => setTab("login")} className="text-[#c8900a] text-xs mt-2 cursor-pointer hover:underline">
                ← Retour à la connexion
              </p>
            </div>
          )}

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

            {tab === "login" && (
            <p onClick={() => setTab("forgot")} className="text-[#c8900a] text-xs text-center cursor-pointer hover:underline">
              Mot de passe oublié ?
            </p>
          )}

          <button onClick={handleSubmit} className="bg-[#1a1408] text-[#e8c060] font-bold py-3 rounded tracking-widest text-sm hover:bg-[#3a2a10]">
            {tab === "login" ? "Se connecter" : tab === "register" ? "Créer mon compte" : "Envoyer le lien"}
          </button>
        </div>
      </div>
    </div>
  )
}

function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const token = new URLSearchParams(window.location.search).get("token")

  const handleReset = async () => {
    if (password.length < 8) {
        setMessage("Le mot de passe doit faire au moins 8 caractères")
        return
    }
    const response = await fetch("http://localhost:4000/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password })
    })
    const data = await response.json()
      if (!response.ok) {
        setMessage(data.error)
      } else {
        setTimeout(() => navigate("/"), 2000)
        setMessage("Mot de passe mis à jour ! Redirection...")
      }
  }

  return (
    <div className="min-h-screen bg-[#fffdf7] flex items-center justify-center">
      <div className="bg-white border border-[#e0cc88] rounded w-[400px] p-6 flex flex-col gap-4">
        <h2 className="text-[#1a1408] font-bold tracking-widest text-center">NOUVEAU MOT DE PASSE</h2>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Nouveau mot de passe" className="border border-[#d8c090] rounded px-3 py-2 text-sm" />
        {message && <p className="text-sm text-center text-[#c8900a]">{message}</p>}
        <button onClick={handleReset} className="bg-[#1a1408] text-[#e8c060] font-bold py-3 rounded">
          Réinitialiser
        </button>
      </div>
    </div>
  )
}

function App() {
  const [showAuth, setShowAuth] = useState(false)
  const [user, setUser] = useState(null)
  const [authTab, setAuthTab] = useState("login")

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div className="App">
            {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={(u) => { setUser(u); setShowAuth(false) }} initialTab={authTab} />}
            <Header onAuthClick={(tab) => { setAuthTab(tab || "login"); setShowAuth(true) }} user={user} onLogout={() => setUser(null)} />
            <Hero onAuthClick={() => setShowAuth(true)} user={user} />
            <Quote />
            <Slider />
            <News />
            <Footer />
          </div>
        } />
        <Route path="/reset-password" element={<ResetPassword onLogin={(u) => { setUser(u) }} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;