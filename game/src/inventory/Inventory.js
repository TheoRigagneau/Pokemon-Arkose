import { TeamMixin }      from "./Team.js"
import { BagMixin }       from "./Bag.js"
import { PokedexMixin }   from "./Pokedex.js"
import { BadgesMixin }    from "./Badge.js"
import { SettingsMixin }  from "./Settings.js"
import { LearnMoveMixin } from "./LearnMove.js"

import { PCMixin } from "./PC.js"
import { ShopMixin } from "./Shop.js"

export default class Inventory {
    constructor(uiCanvas, uiCtx, assets) {
        this.canvas = uiCanvas
        this.ctx = uiCtx
        this.assets = assets
        this.isOpen = false
        this.activeTab = null

        this.teamData = []
        this.teamSprites = {}
        this.showTeam = false
        this.selectedPokemon = null
        this.pendingEvolutionMessage = null
        this.fetchTeam()

        this.showPokedex = false
        this.pokedexData = []
        this.pokedexSprites = {}

        this.showSac = false
        this.inventoryData = []
        this.itemsData = []

        this.selectedItem = null
        this.pendingMove = null
        this.pendingMovePoke = null

        this.showBadges = false
        this.saveMessage = null

        this.showSettings = false
        this.settingsVolume = 0.5

        this.showPC = false
        this.pcData = []
        this.pcSprites = {}
        this.pcSelected = null

        this.showShop = false
        this.walletAmount = null

        this.tabs = [
            { key: "pokedex",  label: "Pokédex",     icon: "inv_pokedex" },
            { key: "pokemon",  label: "Pokémon",     icon: "inv_pokeball" },
            { key: "sac",      label: "Sac",         icon: "inv_sac" },
            { key: "badges",   label: "Badges",      icon: "inv_badge" },
            { key: "save",     label: "Sauvegarder", icon: "inv_save" },
            { key: "settings", label: "Paramètres",  icon: "inv_parametre" },
            { key: "retour",   label: "Retour",      icon: "inv_retour" },
        ]
        this.hoverTab = null
        this.canvas.addEventListener("mousemove", (e) => {
            const rect = this.canvas.getBoundingClientRect()
            this.updateHover(e.clientX - rect.left, e.clientY - rect.top)
        })
    }

    toggle() {
        this.isOpen = !this.isOpen
        this.showPokedex = false
        this.showTeam = false
        this.selectedPokemon = null
        this.showSac = false
        this.showBadges = false
        this.showSettings = false

        this.showPC = false
        this.showShop = false

        this.canvas.style.pointerEvents = this.isOpen ? "all" : "none"
        if (!this.isOpen) {
            window.dispatchEvent(new CustomEvent("inventoryClose"))
        }
    }

    draw() {
        //aprends un move
        if (this.pendingMove) {
            this.drawLearnMove()
            return
        }

        //dans le pc
        if (this.showPC) {
            this.drawPC()
            return
        }

        //dans le shop
        if (this.showShop) {
            this.drawShop()
            return
        }

        //message d'évolution
        if (this.pendingEvolutionMessage) {
            const ctx = this.ctx
            const w = this.canvas.width
            const h = this.canvas.height
            ctx.fillStyle = "rgba(0,0,0,0.85)"
            ctx.fillRect(0, 0, w, h)
            ctx.fillStyle = "rgba(50,50,50,0.9)"
            ctx.beginPath()
            ctx.roundRect((w - 500) / 2, (h - 80) / 2, 500, 80, 10)
            ctx.fill()
            ctx.fillStyle = "white"
            ctx.font = "bold 14px 'Press Start 2P'"
            ctx.textAlign = "center"
            ctx.fillText(this.pendingEvolutionMessage, w / 2, h / 2 + 5)
            ctx.textAlign = "left"
            return
        }

        if (!this.isOpen) return
        //inventaire de base
        const ctx = this.ctx
        const w = this.canvas.width
        const h = this.canvas.height
        const panelW = w * 0.22
        const panelX = w - panelW

        ctx.fillStyle = "rgba(20, 16, 30, 0.92)"
        ctx.fillRect(panelX, 0, panelW, h)

        ctx.strokeStyle = "rgba(255,255,255,0.15)"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(panelX, 0)
        ctx.lineTo(panelX, h)
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
            //change la couleur et le contour en fonction de la précense ou non du joueur si le bouton retour
            ctx.fillStyle = isRetour ? isHover ? "rgba(220,60,60,0.9)" : "rgba(180,40,40,0.7)"
                : isActive ? "rgba(100,80,140,0.9)" : isHover ? "rgba(80,65,105,0.9)" : "rgba(60,50,80,0.8)"

            ctx.beginPath()
            ctx.roundRect(btnX, btnY, btnW, btnH, 10)
            ctx.fill()

            //même chose pour les autres boutons
            ctx.strokeStyle = isActive ? "rgba(200,170,255,0.6)" : "rgba(255,255,255,0.08)"
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.roundRect(btnX, btnY, btnW, btnH, 10)
            ctx.stroke()

            ctx.fillStyle = "rgba(255,255,255,0.07)"
            ctx.beginPath()
            ctx.roundRect(btnX + 6, btnY + 4, btnW - 12, btnH * 0.35, 6)
            ctx.fill()

            const icon = this.assets.get(tab.icon)
            if (icon) ctx.drawImage(icon, btnX + 10, btnY + btnH / 2 - 16, 32, 32)

            ctx.fillStyle = "white"
            ctx.font = "bold 9px 'Press Start 2P'"
            ctx.textAlign = "left"
            ctx.shadowColor = "rgba(0,0,0,0.5)"
            ctx.shadowBlur = 3
            ctx.fillText(tab.label, btnX + 52, btnY + btnH / 2 + 4)
            ctx.shadowBlur = 0
        })

        if (this.activeTab === "pokedex" && this.showPokedex) this.drawPokedex()
        if (this.activeTab === "pokemon" && this.showTeam) this.drawTeam()
        if (this.activeTab === "sac" && this.showSac) this.drawSac()
        if (this.activeTab === "badges" && this.showBadges) this.drawBadges()
        if (this.activeTab === "settings" && this.showSettings) {this.drawSettings()}
        if (this.pendingMove) this.drawLearnMove()

        //message de sauvegarde
        if (this.saveMessage) {
            const boxW = 400
            const boxH = 80
            const boxX = (w - boxW) / 2
            const boxY = (h - boxH) / 2
            ctx.fillStyle = "rgba(50,50,50,0.9)"
            ctx.beginPath()
            ctx.roundRect(boxX, boxY, boxW, boxH, 10)
            ctx.fill()
            ctx.strokeStyle = "rgba(255,255,255,0.3)"
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.roundRect(boxX, boxY, boxW, boxH, 10)
            ctx.stroke()
            ctx.fillStyle = "white"
            ctx.font = "bold 12px 'Press Start 2P'"
            ctx.textAlign = "center"
            ctx.fillText(this.saveMessage, w / 2, h / 2 + 5)
            ctx.textAlign = "left"
        }

        ctx.textAlign = "left"
    }
    //regarde ou clique le joueur
    handleClick(mouseX, mouseY) {
        //si le poké apprend un move
        if (this.pendingMove) {
            const w = this.canvas.width
            const h = this.canvas.height
            const bw = w * 0.4
            const bh = h * 0.09
            const moves = [...this.pendingMovePoke.moves, "NE PAS APPRENDRE"]
            moves.forEach((move, i) => {
                const x = w / 2 - bw / 2
                const y = h * 0.45 + i * (bh + 10)
                if (mouseX >= x && mouseX <= x + bw && mouseY >= y && mouseY <= y + bh) {
                    if (move !== "NE PAS APPRENDRE") {
                        const index = this.pendingMovePoke.moves.indexOf(move)
                        this.pendingMovePoke.moves[index] = this.pendingMove
                        fetch(`http://localhost:3000/api/team/${this.pendingMovePoke._id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ moves: this.pendingMovePoke.moves })
                        })
                    }
                    this.pendingMove = null
                    this.pendingMovePoke = null
                }
            })
            return
        }
        //si le joueur est dans le pc
        if (this.showPC) {
            const w = this.canvas.width
            const h = this.canvas.height

            if (mouseX >= w - 80 && mouseX <= w - 20 && mouseY >= 10 && mouseY <= 60) {
                this.showPC = false
                this.pcSelected = null
                this.canvas.style.pointerEvents = "none"
                window.dispatchEvent(new CustomEvent("inventoryClose"))
                return
            }

            const slotW = w / 2 - 30
            const slotH = 70
            const startY = 90
            //mets un poké du pc dans la team
            for (let i = 0; i < 6; i++) {
                const x = 15
                const y = startY + i * (slotH + 8)
                if (mouseX >= x && mouseX <= x + slotW && mouseY >= y && mouseY <= y + slotH) {
                    this.swapPCPokemon("team", i)
                    return
                }
            }

            for (let i = 0; i < 6; i++) {
                const x = w / 2 + 15
                const y = startY + i * (slotH + 8)
                //mets un poke de la team dans le pc
                if (mouseX >= x && mouseX <= x + slotW && mouseY >= y && mouseY <= y + slotH) {
                    this.swapPCPokemon("pc", i)
                    return
                }
            }
            return
        }

        //si le joueur est dans le shop
        if (this.showShop) {
            const w = this.canvas.width
            const h = this.canvas.height

            if (mouseX >= w - 80 && mouseX <= w - 20 && mouseY >= 10 && mouseY <= 60) {
                this.showShop = false
                this.canvas.style.pointerEvents = "none"
                window.dispatchEvent(new CustomEvent("inventoryClose"))
                return
            }

            const items = [
                { name: "Potion",   price: 300 },
                { name: "Pokéball", price: 200 },
            ]
            //achete un objet
            items.forEach((item, i) => {
                const x = w * 0.1
                const y = h * 0.2 + i * h * 0.16
                if (mouseX >= x && mouseX <= x + w * 0.8 &&
                    mouseY >= y && mouseY <= y + h * 0.12) {
                    this.buyItem(item.name, item.price)
                }
            })
            return
        }
        //s'il est dans les settings
        if (this.showSettings) {
            const w = this.canvas.width
            const h = this.canvas.height

            if (mouseX >= w - 80 && mouseX <= w - 20 && mouseY >= 10 && mouseY <= 60) {
                this.showSettings = false
                return
            }

            const barX = w * 0.1
            const barY = h * 0.38
            const barW = w * 0.8
            const barH = 20
            //gère le son de la musique
            if (mouseX >= barX && mouseX <= barX + barW &&
                mouseY >= barY - 10 && mouseY <= barY + barH + 10) {
                this.settingsVolume = (mouseX - barX) / barW
                this.settingsVolume = Math.max(0, Math.min(1, this.settingsVolume))
                window.dispatchEvent(new CustomEvent("volumeChange", { detail: { volume: this.settingsVolume } }))
            }
            return
        }

        if (!this.isOpen) return

        const w = this.canvas.width
        //s'il clique sur Pokedex
        if (this.showPokedex) {
            if (mouseX >= w - 80 && mouseX <= w - 20 && mouseY >= 10 && mouseY <= 60) {
                this.showPokedex = false
            }
            return
        }
        //s'il clique sur Équipe
        if (this.showTeam) {
            const h = this.canvas.height
            //s'il appuie sur le bouton retour
            if (mouseX >= w - 80 && mouseX <= w - 20 && mouseY >= 10 && mouseY <= 60) {
                if (this.selectedPokemon) this.selectedPokemon = null
                else if (this.selectedItem) { this.selectedItem = null; this.showTeam = false; this.showSac = true }
                else this.showTeam = false
                return
            }

            //s'il regarde les stats du poké
            if (this.selectedPokemon) return
            const slots = [
                { x: 10, y: 70 }, { x: w / 2 + 5, y: 70 },
                { x: 10, y: 70 + h * 0.28 }, { x: w / 2 + 5, y: 70 + h * 0.28 },
                { x: 10, y: 70 + h * 0.56 }, { x: w / 2 + 5, y: 70 + h * 0.56 },
            ]
            const sw = w / 2 - 15
            const sh = h * 0.24
            for (let i = 0; i < this.teamData.length; i++) {
                if (!this.teamData[i]) continue
                if (mouseX >= slots[i].x && mouseX <= slots[i].x + sw && mouseY >= slots[i].y && mouseY <= slots[i].y + sh) {
                    if (this.selectedItem) {
                        //s'il a séléctionner un item et qu'il a été renvoyer sur la page team
                        const item = this.itemsData.find(it => it.name === this.selectedItem.itemName)
                        if (item?.type === "candy") { 
                            //level-up le poké choisi
                            this.useCandy(this.teamData[i])
                            return 
                        }

                        if (item?.type === "heal") {
                            //heal le poké choisi
                        this.useHeal(this.teamData[i], item)
                        return

                        }
                        if (item?.type === "revive") {
                            //revive le poké choisi
                            this.useRevive(this.teamData[i])
                            return
                        }
                    }

                    this.selectedPokemon = { poke: this.teamData[i], index: i }
                    return
                }
            }
            return
        }
        
        //s'il clique sur sac
        if (this.showSac) {
            const h = this.canvas.height
            if (mouseX >= w - 80 && mouseX <= w - 20 && mouseY >= 10 && mouseY <= 60) {
                this.showSac = false; return 
            }
            const healItems = this.inventoryData.filter(inv => {
                const item = this.itemsData.find(i => i.name === inv.itemName)
                return item?.type === "heal" || item?.type === "revive" || item?.type === "candy"
            })
            //fait les cases en fonction des items de heal
            healItems.forEach((inv, i) => {
                const x = w * 0.04
                const y = h * 0.2 + i * h * 0.12
                if (mouseX >= x && mouseX <= x + w * 0.42 && mouseY >= y && mouseY <= y + h * 0.1) {
                    //s'il peut utilsier l'item, renvoie sur la page team pour l'utiliser
                    if (inv.quantity > 0) {
                        this.selectedItem = inv
                        this.activeTab = "pokemon"
                        this.showSac = false
                        this.showTeam = true
                        this.fetchTeam()
                    }
                }
            })
            return
        }
        //renvoie sur la page badge
        if (this.showBadges) {
            if (mouseX >= w - 80 && mouseX <= w - 20 && mouseY >= 10 && mouseY <= 60) {
                this.showBadges = false
            }
            return
        }

        const panelW = w * 0.22
        const panelX = w - panelW
        const btnH = 60
        const btnMargin = 10
        const startY = 65
        this.tabs.forEach((tab, i) => {
            //vérifie si sur une page le joueur a cliqué sur le bouton retour
            const btnY = startY + i * (btnH + btnMargin)
            const btnX = panelX + 10
            const btnW = panelW - 20
            if (mouseX >= btnX && mouseX <= btnX + btnW && mouseY >= btnY && mouseY <= btnY + btnH) {
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

    async handleKey(key) {
        if (!this.isOpen) return
        //ferme l'inventaire
        if (key === "x") {
            this.isOpen = false
            this.canvas.style.pointerEvents = "none"
            window.dispatchEvent(new CustomEvent("inventoryClose"))
            return
        }

        //monte dans l'inventaire
        const currentIndex = this.tabs.findIndex(t => t.key === this.activeTab)
        if (key === "s") {
            const next = currentIndex + 1
            this.activeTab = next < this.tabs.length ? this.tabs[next].key : this.tabs[0].key
        }
        //descend dans l'inventaire
        if (key === "z") {
            const prev = currentIndex - 1
            this.activeTab = prev >= 0 ? this.tabs[prev].key : this.tabs[this.tabs.length - 1].key
        }
        //va sur la page visée
        if (key === " ") {
            if (this.activeTab === "retour") {
                this.isOpen = false
                this.canvas.style.pointerEvents = "none"
                window.dispatchEvent(new CustomEvent("inventoryClose"))
            } 

            else if (this.activeTab === "pokedex") {
                if (this.showPokedex) { this.showPokedex = false; return }
                await this.fetchPokedex(); this.showPokedex = true
            } 

            else if (this.activeTab === "pokemon") {
                if (this.showTeam) { this.showTeam = false; return }
                await this.fetchTeam(); this.showTeam = true
            } 

            else if (this.activeTab === "sac") {
                if (this.showSac) { this.showSac = false; return }
                await this.fetchInventory(); this.showSac = true
            } 
            
            else if (this.activeTab === "badges") {
                this.showBadges = !this.showBadges
            } 
            
            else if (this.activeTab === "save") {
                window.dispatchEvent(new CustomEvent("saveGame"))
                this.saveMessage = "Partie sauvegardée !"
                setTimeout(() => { this.saveMessage = null }, 2000)
            } 
            
            else if (this.activeTab === "settings") {
                if (this.showSettings) {
                    this.showSettings = false
                } else {
                    this.showSettings = true
                }
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
            if (mouseX >= btnX && mouseX <= btnX + btnW && mouseY >= btnY && mouseY <= btnY + btnH) {
                this.hoverTab = tab.key
            }
        })
        this.canvas.style.cursor = this.hoverTab ? "pointer" : "default"
    }
}

Object.assign(Inventory.prototype, TeamMixin, BagMixin, PokedexMixin, BadgesMixin, LearnMoveMixin, PCMixin, SettingsMixin, ShopMixin)