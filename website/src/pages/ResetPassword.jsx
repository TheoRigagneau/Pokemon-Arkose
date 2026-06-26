import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const token = new URLSearchParams(window.location.search).get("token")

  const handleReset = async () => {
    if (password.length < 8) {
      setMessage("Le mot de passe doit faire au moins 8 caractères")
      return
    }

    try {
      const response = await fetch("http://localhost:4000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue")
      }

      setMessage("Mot de passe mis à jour ! Redirection...")
      setTimeout(() => navigate("/"), 2000)
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    //page qui permet de rénitialiser le password lancé via le mail envoyé
    <div className="min-h-screen bg-[#fffdf7] flex items-center justify-center">
      <div className="bg-white border border-[#e0cc88] rounded w-[400px] p-6 flex flex-col gap-4">
        <h2 className="text-[#1a1408] font-bold tracking-widest text-center">NOUVEAU MOT DE PASSE</h2>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nouveau mot de passe"
          className="border border-[#d8c090] rounded px-3 py-2 text-sm"
        />

        {message && (
          <p className="text-sm text-center text-[#c8900a]">{message}</p>
        )}

        <button
          onClick={handleReset}
          className="bg-[#1a1408] text-[#e8c060] font-bold py-3 rounded"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  )
}