import React from "react"
import Header from "../components/Header.jsx"
import Hero from "../components/Hero.jsx"
import Quote from "../components/Quote.jsx"
import Slider from "../components/Slider.jsx"
import News from "../components/News.jsx"
import Footer from "../components/Footer.jsx"
import AuthModal from "../components/AuthModal.jsx"

export default function Index({ user, setUser, showAuth, setShowAuth, authTab, setAuthTab, onLogout }) {
  return (
    <div className="App">
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={(u) => {
            setUser(u)
            setShowAuth(false)
          }}
          initialTab={authTab}
        />
      )}

      {/* affiche le header et le nom de l'utilisateur ou la possibilité de se connecter */}
      <Header
        user={user}
        onLogout={onLogout}
        onAuthClick={(tab) => {
          setAuthTab(tab || "login")
          setShowAuth(true)
        }}
      />
      
      {/* affihce la suite de la page principal */}
      <Hero
        user={user}
        onAuthClick={() => setShowAuth(true)}
      />

      <Quote />
      <Slider />
      <News />
      <Footer />
    </div>
  )
}