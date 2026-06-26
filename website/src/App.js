import { useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Index from "./pages/Index.jsx"
import ResetPassword from "./pages/ResetPassword.jsx"
import Forum from "./pages/Forum.jsx"
import Play from "./pages/Play.jsx"
import MentionsLegales from "./pages/MentionsLegales.jsx"
import Contact from "./pages/Contact.jsx"

function App() {
  const [showAuth, setShowAuth] = useState(false)
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token')
    const pseudo = localStorage.getItem('pseudo')
    const role = localStorage.getItem('role')
    return token && pseudo ? { token, pseudo, role } : null
  })

  const [authTab, setAuthTab] = useState("login")

  const login = (u) => {
    localStorage.setItem('token', u.token)
    localStorage.setItem('pseudo', u.pseudo)
    localStorage.setItem('role', u.role)
    setUser(u)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('pseudo')
    localStorage.removeItem('role')
    setUser(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
            <Index
              user={user}
              setUser={login}
              showAuth={showAuth}
              setShowAuth={setShowAuth}
              authTab={authTab}
              setAuthTab={setAuthTab}
              onLogout={logout}
            />
          }
        />

        <Route path="/forum" element={
          <Forum
            user={user}
            setUser={login}
            showAuth={showAuth}
            setShowAuth={setShowAuth}
            authTab={authTab}
            setAuthTab={setAuthTab}
            onLogout={logout}
          />
          }
        />

        <Route path="/play" element={
          <Play
            user={user}
            setUser={login}
            showAuth={showAuth}
            setShowAuth={setShowAuth}
            authTab={authTab}
            setAuthTab={setAuthTab}
            onLogout={logout}
          />
          } 
        />

        <Route path="/mentions-legales" element={
          <MentionsLegales 
          user={user} 
          setUser={login} 
          showAuth={showAuth} 
          setShowAuth={setShowAuth} 
          authTab={authTab} 
          setAuthTab={setAuthTab} 
          onLogout={logout} 
          />
        }/>

        <Route path="/contact" element={
          <Contact 
          user={user}
          setUser={login}
          showAuth={showAuth}
          setShowAuth={setShowAuth}
          authTab={authTab}
          setAuthTab={setAuthTab}
          onLogout={logout}
          />
        }/>

        <Route path="/reset-password" element={
          <ResetPassword 
          />
        }/>
      </Routes>
    </BrowserRouter>
  )
}

export default App