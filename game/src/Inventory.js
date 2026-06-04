export default class Inventory {
    constructor(uiCanvas, uiCtx, assets) {
        this.canvas = uiCanvas
        this.ctx = uiCtx
        this.assets = assets
        this.isOpen = false
        this.activeTab = null

        this.tabs = [
            { key: "pokedex",    label: "Pokédex",     icon: "inv_pokedex" },
            { key: "pokemon",    label: "Pokémon",     icon: "inv_pokeball" },
            { key: "sac",        label: "Sac",         icon: "inv_sac" },
            { key: "badges",     label: "Badges",      icon: "inv_badge" },
            { key: "save",       label: "Sauvegarder", icon: "inv_save" },
            { key: "settings",   label: "Paramètres",  icon: "inv_parametre" },
            { key: "retour",     label: "Retour",      icon: "inv_retour" },
        ]
        this.hoverTab = null
        this.canvas.addEventListener("mousemove", (e) => {
            const rect = this.canvas.getBoundingClientRect()
            this.updateHover(e.clientX - rect.left, e.clientY - rect.top)
        })
    }

    toggle() {
        this.isOpen = !this.isOpen
        this.canvas.style.pointerEvents = this.isOpen ? "all" : "none"
        if (!this.isOpen) {
            window.dispatchEvent(new CustomEvent("inventoryClose"))
        }
    }

    draw() {
        if (!this.isOpen) return

        const ctx = this.ctx
        const w = this.canvas.width
        const h = this.canvas.height

        const panelW = w * 0.22
        const panelX = w - panelW
        const panelH = h

        ctx.fillStyle = "rgba(20, 16, 30, 0.92)"
        ctx.fillRect(panelX, 0, panelW, panelH)

        ctx.strokeStyle = "rgba(255,255,255,0.15)"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(panelX, 0)
        ctx.lineTo(panelX, panelH)
        ctx.stroke()

        ctx.fillStyle = "white"
        ctx.font = "bold 11px 'Press Start 2P'"
        ctx.textAlign = "center"
        ctx.fillText("MENU", panelX + panelW / 2, 40)

        ctx.strokeStyle = "rgba(255,255,255,0.1)"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(panelX + 16, 52)
        ctx.lineTo(w - 16, 52)
        ctx.stroke()

        const btnH = 60
        const btnMargin = 10
        const startY = 65

        this.tabs.forEach((tab, i) => {
            const btnY = startY + i * (btnH + btnMargin)
            const btnX = panelX + 10
            const btnW = panelW - 20

            const isRetour = tab.key === "retour"
            const isActive = this.activeTab === tab.key

            const isHover = this.hoverTab === tab.key

            ctx.fillStyle = isRetour
                ? isHover ? "rgba(220, 60, 60, 0.9)" : "rgba(180, 40, 40, 0.7)"
                : isActive
                ? "rgba(100, 80, 140, 0.9)"
                : isHover
                ? "rgba(80, 65, 105, 0.9)"
                : "rgba(60, 50, 80, 0.8)"

            ctx.beginPath()
            ctx.roundRect(btnX, btnY, btnW, btnH, 10)
            ctx.fill()

            ctx.strokeStyle = isActive
                ? "rgba(200,170,255,0.6)"
                : "rgba(255,255,255,0.08)"
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.roundRect(btnX, btnY, btnW, btnH, 10)
            ctx.stroke()

            ctx.fillStyle = "rgba(255,255,255,0.07)"
            ctx.beginPath()
            ctx.roundRect(btnX + 6, btnY + 4, btnW - 12, btnH * 0.35, 6)
            ctx.fill()

            const icon = this.assets.get(tab.icon)
            if (icon) {
                ctx.drawImage(icon, btnX + 10, btnY + btnH / 2 - 16, 32, 32)
            }

            ctx.fillStyle = "white"
            ctx.font = "bold 9px 'Press Start 2P'"
            ctx.textAlign = "left"
            ctx.shadowColor = "rgba(0,0,0,0.5)"
            ctx.shadowBlur = 3
            ctx.fillText(tab.label, btnX + 52, btnY + btnH / 2 + 4)
            ctx.shadowBlur = 0
        })

        ctx.textAlign = "left"
    }

    handleClick(mouseX, mouseY) {
        if (!this.isOpen) return

        const w = this.canvas.width
        const panelW = w * 0.22
        const panelX = w - panelW

        const btnH = 60
        const btnMargin = 10
        const startY = 65

        this.tabs.forEach((tab, i) => {
            const btnY = startY + i * (btnH + btnMargin)
            const btnX = panelX + 10
            const btnW = panelW - 20

            if (mouseX >= btnX && mouseX <= btnX + btnW &&
                mouseY >= btnY && mouseY <= btnY + btnH) {
                if (tab.key === "retour") {
                    this.isOpen = false
                    this.canvas.style.pointerEvents = "none"    
                    window.dispatchEvent(new CustomEvent("inventoryClose"))
                } else {
                    this.activeTab = tab.key
                }
            }
        })
    }

    handleKey(key) {
        if (!this.isOpen) return

        if (key === "x") {
            this.isOpen = false
            this.canvas.style.pointerEvents = "none"
            window.dispatchEvent(new CustomEvent("inventoryClose"))
            return
        }


        const currentIndex = this.tabs.findIndex(t => t.key === this.activeTab)
        
        if (key === "s") {
            const next = currentIndex + 1
            if (next < this.tabs.length) this.activeTab = this.tabs[next].key
            else this.activeTab = this.tabs[0].key
        }
        if (key === "z") {
            const prev = currentIndex - 1
            if (prev >= 0) this.activeTab = this.tabs[prev].key
            else this.activeTab = this.tabs[this.tabs.length - 1].key
        }
        if (key === " ") {
            if (this.activeTab === "retour") {
                this.isOpen = false
                this.canvas.style.pointerEvents = "none"
                window.dispatchEvent(new CustomEvent("inventoryClose"))
            }
        }
    }

    updateHover(mouseX, mouseY) {
        if (!this.isOpen) return
        const w = this.canvas.width
        const panelW = w * 0.22
        const panelX = w - panelW
        const btnH = 60
        const btnMargin = 10
        const startY = 65

        this.hoverTab = null
        this.tabs.forEach((tab, i) => {
            const btnY = startY + i * (btnH + btnMargin)
            const btnX = panelX + 10
            const btnW = panelW - 20
            if (mouseX >= btnX && mouseX <= btnX + btnW &&
                mouseY >= btnY && mouseY <= btnY + btnH) {
                this.hoverTab = tab.key
            }
        })
        this.canvas.style.cursor = this.hoverTab ? "pointer" : "default"
    }
}    