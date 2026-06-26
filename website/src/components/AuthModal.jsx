import { useState } from "react"

export default function AuthModal({ onClose, onLogin, initialTab = "login" }) {
  const [tab, setTab] = useState(initialTab)
  const [pseudo, setPseudo] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    setError("")

    if (tab === "forgot") {
      // crée la requete pour envoyer le message de rénitialisation du mdp
      await fetch("http://localhost:4000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })
      setTab("login")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    //vérifie si l'email est possible
    if (!emailRegex.test(email)) {
      setError("Email invalide")
      return
    }

    if (password.length < 8) {
      setError("Le mot de passe doit faire au moins 8 caractères")
      return
    }

    let url
    if (tab === "login") {
        url = "http://localhost:4000/api/auth/login"
    } else {
        url = "http://localhost:4000/api/auth/register"
    }

    let body
    if (tab === "login") {
        body = { email, password }
    } else {
        body = { pseudo, email, password }
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    if (!response.ok) {
      setError(data.error)
      return
    }
    onLogin({ pseudo: data.pseudo, token: data.token, role: data.role })
  }

  return (
    //page d'authentification (login, register et aussi la page pour remplacer son mdp)
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#fffdf7] border border-[#e0cc88] rounded w-[480px]">

        <div className="bg-[#1a1408] rounded-t flex items-center justify-between px-6 py-3">
          <h2 className="text-[#e8c060] font-bold tracking-widest text-sm">
            {tab === "login"
              ? "CONNEXION"   : tab === "register"
              ? "INSCRIPTION" : "MOT DE PASSE OUBLIÉ"}
          </h2>
          <button onClick={onClose} className="text-[#7a5a20] hover:text-[#c8a050] text-xl">×</button>
        </div>

        <div className="flex border-b border-[#e0cc88]">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 py-3 text-sm font-bold tracking-wide ${
              tab === "login"
                ? "text-[#1a1005] border-b-2 border-[#c8900a]"
                : "text-[#9a7a38]"
            }`}
          >
            Connexion
          </button>

          <button
            onClick={() => setTab("register")}
            className={`flex-1 py-3 text-sm font-bold tracking-wide ${
              tab === "register"
                ? "text-[#1a1005] border-b-2 border-[#c8900a]"
                : "text-[#9a7a38]"
            }`}
          >
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
              <input
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                className="w-full mt-1 border border-[#d8c090] rounded px-3 py-2 bg-[#fffdf7] text-sm"
              />
            </div>
          )}

          {tab !== "forgot" && (
            <>
              <div>
                <label className="text-[#8a6a28] text-xs tracking-widest">EMAIL</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 border border-[#d8c090] rounded px-3 py-2 bg-[#fffdf7] text-sm"
                />
              </div>

              <div>
                <label className="text-[#8a6a28] text-xs tracking-widest">MOT DE PASSE</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mt-1 border border-[#d8c090] rounded px-3 py-2 bg-[#fffdf7] text-sm"
                />
              </div>
            </>
          )}

          {tab === "forgot" && (
            <div>
              <p className="text-[#5a4a20] text-xs mb-3">
                Entre ton email pour recevoir un lien de réinitialisation.
              </p>

              <label className="text-[#8a6a28] text-xs tracking-widest">EMAIL</label>
              <input
                type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 border border-[#d8c090] rounded px-3 py-2 bg-[#fffdf7] text-sm" />

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
            {tab === "login" ? "Se connecter" : tab === "register"
                             ? "Créer mon compte" : "Envoyer le lien"}
          </button>
        </div>
      </div>
    </div>
  )
}
