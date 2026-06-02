export default class Battle {
    constructor(ctx, canvas, encounter) {
        this.ctx = ctx
        this.canvas = canvas
        this.encounter = encounter
        this.enemyDisplayHP = this.enemyMaxHP
        this.currentMenu = "main"

        window.addEventListener("keydown", (event) => {
            if (event.key === "a") {
                this.enemyCurrentHP -= 10
                if (this.enemyCurrentHP < 0) this.enemyCurrentHP = 0
            }
            if (event.key === "v") {
                this.playerCurrentHP -=10
                if (this.playerCurrentHP < 0) this.playerCurrentHP = 0
            }
        })

        this.canvas.addEventListener("click", (e) => {
            const rect = this.canvas.getBoundingClientRect()
            const mouseX = e.clientX - rect.left
            const mouseY = e.clientY - rect.top
            
            const w = this.canvas.width
            const h = this.canvas.height
            const bw = w * 0.32
            const bh = h * 0.1

            if (this.currentMenu !== "main") {
                const backX = w * 0.85
                const backY = h * 0.62
                const backW = w * 0.12
                const backH = h * 0.06
                
                if (mouseX >= backX && mouseX <= backX + backW &&
                    mouseY >= backY && mouseY <= backY + backH) {
                    this.currentMenu = "main"
                    return
                }
            }

            if (this.currentMenu === "bag") {
                const slots = [
                    { label: "heal",     x: w * 0.335, y: h * 0.69 },
                    { label: "pokeball", x: w * 0.56,  y: h * 0.69 },
                    { label: "status",   x: w * 0.335, y: h * 0.84 },
                    { label: "boost",    x: w * 0.56,  y: h * 0.84 },
                ]
                const sw = w * 0.18
                const sh = h * 0.1

                for (const slot of slots) {
                    this.ctx.strokeStyle = "red"
                    this.ctx.lineWidth = 2
                    this.ctx.strokeRect(slot.x - sw/2, slot.y - sh/2, sw, sh)
                }

                for (const slot of slots) {
                    if (mouseX >= slot.x - sw/2 && mouseX <= slot.x + sw/2 &&
                        mouseY >= slot.y - sh/2 && mouseY <= slot.y + sh/2) {
                        if (slot.label === "pokeball") this.capture()
                        else this.currentMenu = slot.label
                    }
                }
                return
            }

            if (this.currentMenu === "main") {
                const buttons = [
                    { label: "COMBAT", x: w * 0.3, y: h * 0.68 },
                    { label: "SAC",    x: w * 0.7, y: h * 0.68 },
                    { label: "POKEMON", x: w * 0.3, y: h * 0.84 },
                    { label: "FUITE",  x: w * 0.7, y: h * 0.84 },
                ]
                
                for (const btn of buttons) {
                    if (mouseX >= btn.x - bw/2 && mouseX <= btn.x + bw/2 &&
                        mouseY >= btn.y - bh/2 && mouseY <= btn.y + bh/2) {
                        this.handleButton(btn.label)
                    }
                }
            }
        })
    }

    async init() {
        this.enemySprite = await this.loadImage(`./game/assets/pokemon/dp/shiny/${this.encounter.id}.png`)
        this.field = await this.loadImage("./game/assets/battle/field_day.png")
        this.platform = await this.loadImage("./game/assets/battle/grass_platform.png")
        this.enemy_hp_bar = await this.loadImage("./game/assets/battle/enemy_hp_bar.png")
        this.pokemon_bar = await this.loadImage("./game/assets/battle/player_hp_bar.png")
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${this.encounter.id}`)
        const data = await response.json()
        const stats = data.stats

        this.enemyMaxHP = stats.find(s => s.stat.name === "hp").base_stat
        this.enemyAttack = stats.find(s => s.stat.name === "attack").base_stat
        this.enemyDefense = stats.find(s => s.stat.name === "defense").base_stat
        this.enemySpeed = stats.find(s => s.stat.name === "speed").base_stat
        this.enemyDisplayHP = this.enemyMaxHP
        this.enemyCurrentHP = this.enemyMaxHP
        this.battleEnded = false
        this.teamSlotBlue = await this.loadImage("./game/assets/battle/blue_bc_team.png")
        this.teamSlotBlack = await this.loadImage("./game/assets/battle/black_bc_team.png")
        this.slot_obj = await this.loadImage("./game/assets/battle/fond_objets.png")
        this.background = await this.loadImage("./game/assets/battle/bg_obj.png")
        this.attack = await this.loadImage("./game/assets/battle/attack_sprite.png")

        const teamResponse = await fetch("http://localhost:3000/api/team")
        const team = await teamResponse.json()
        if (team.length > 0) {
            this.playerPokemon = team[0]
            this.playerSprite = await this.loadImage(`./game/assets/pokemon/dp/back/${this.playerPokemon.id}.png`)

            const playerResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${this.playerPokemon.id}`)
            const playerData = await playerResponse.json()
            const playerStats = playerData.stats
            this.playerMaxHP = playerStats.find(s => s.stat.name === "hp").base_stat
            this.playerCurrentHP = this.playerMaxHP
            this.playerDisplayHP = this.playerMaxHP
            this.playerMoves = this.playerPokemon.moves
            console.log(this.playerPokemon)
        }
    }

    loadImage(path) {
        return new Promise((resolve) => {
            const img = new Image()
            img.src = path
            img.onload = () => resolve(img)
            img.onerror = () => {
            console.warn(`Failed to load image: ${path}`)
            resolve(null)
        }
        })
    }

    async capture() {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${this.encounter.id}`)
        const data = await response.json()
        console.log("moves bruts:", data.moves)
        const moves = data.moves.slice(0, 4).map(m => m.move.name)
        console.log("moves finaux:", moves)
        console.log("body:", JSON.stringify({ pokemon: this.encounter.pokemon, id: this.encounter.id, niveau: this.encounter.niveau, moves: moves }))

        await fetch("http://localhost:3000/api/team", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                pokemon: this.encounter.pokemon,
                id: this.encounter.id,
                niveau: this.encounter.niveau,
                moves: moves
            })
        })
        window.dispatchEvent(new CustomEvent("endBattle"))
    }

    drawButtons(ctx, w, h) {
        const buttons = [
            { label: "COMBAT", color: "#e05555", shadow: "#a03030", x: w * 0.3, y: h * 0.68 },
            { label: "SAC", color: "#d4a020", shadow: "#9a6e10", x: w * 0.7, y: h * 0.68 },
            { label: "POKEMON", color: "#50a850", shadow: "#307030", x: w * 0.3, y: h * 0.84 },
            { label: "FUITE", color: "#4080d0", shadow: "#205090", x: w * 0.7, y: h * 0.84 },
        ]

        const bw = w * 0.32
        const bh = h * 0.1

        for (const btn of buttons) {
            const bx = btn.x - bw / 2
            const by = btn.y - bh / 2

            ctx.fillStyle = btn.shadow
            ctx.beginPath()
            ctx.roundRect(bx + 4, by + 6, bw, bh, 16)
            ctx.fill()

            ctx.fillStyle = btn.color
            ctx.beginPath()
            ctx.roundRect(bx, by, bw, bh, 16)
            ctx.fill()

            ctx.fillStyle = "rgba(255,255,255,0.25)"
            ctx.beginPath()
            ctx.roundRect(bx + 8, by + 4, bw - 16, bh * 0.4, 10)
            ctx.fill()

            ctx.fillStyle = "white"
            ctx.font = "bold 13px 'Press Start 2P'"
            ctx.textAlign = "center"
            ctx.shadowColor = "rgba(0,0,0,0.4)"
            ctx.shadowBlur = 4
            ctx.fillText(btn.label, btn.x, btn.y + 6)
            ctx.shadowBlur = 0
            ctx.textAlign = "left"
        }
    }
    drawObjects(ctx, w, h) {
    ctx.fillStyle = "#6b5f78"
    ctx.fillRect(0, h * 0.55, w, h * 0.45)

    if (this.slot_obj) {
        const imgW = w * 0.5
        const imgH = h * 0.38
        const imgX = (w - imgW) / 2
        ctx.drawImage(this.slot_obj, imgX, h * 0.58, imgW, imgH)
    }

}

    drawAttacks(ctx, w, h) {
        ctx.fillStyle = "#6b5f78"
        ctx.fillRect(0, h * 0.55, w, h * 0.45)

        if (!this.playerPokemon?.moves) return

        const positions = [
            { x: w * 0.25, y: h * 0.685 },
            { x: w * 0.75, y: h * 0.685 },
            { x: w * 0.25, y: h * 0.865 },
            { x: w * 0.75, y: h * 0.865 },
        ]
        const bw = w * 0.38
        const bh = h * 0.13

        for (let i = 0; i < this.playerPokemon.moves.length; i++) {
            const bx = positions[i].x - bw / 2
            const by = positions[i].y - bh / 2

            ctx.fillStyle = "#1a5c1a"
            ctx.beginPath()
            ctx.roundRect(bx + 4, by + 6, bw, bh, 12)
            ctx.fill()

            ctx.fillStyle = "#2ea82e"
            ctx.beginPath()
            ctx.roundRect(bx, by, bw, bh, 12)
            ctx.fill()

            ctx.fillStyle = "rgba(255,255,255,0.2)"
            ctx.beginPath()
            ctx.roundRect(bx + 8, by + 4, bw - 16, bh * 0.35, 8)
            ctx.fill()

            ctx.fillStyle = "white"
            ctx.font = "bold 12px 'Press Start 2P'"
            ctx.textAlign = "center"
            ctx.shadowColor = "rgba(0,0,0,0.5)"
            ctx.shadowBlur = 4
            ctx.fillText(
                this.playerPokemon.moves[i].toUpperCase().replace(/-/g, ' '),
                positions[i].x,
                positions[i].y + 5
            )
            ctx.shadowBlur = 0
        }
        ctx.textAlign = "left"
    }

    drawTeam(ctx, w, h) {
        ctx.fillStyle = "#6b5f78"
        ctx.fillRect(0, h * 0.55, w, h * 0.45)
    }
    drawHeal(ctx, w, h) {
        ctx.fillStyle = "#6b5f78"
        ctx.fillRect(0, h * 0.55, w, h * 0.45)
    }
    drawStatus(ctx, w, h) {
        ctx.fillStyle = "#6b5f78"
        ctx.fillRect(0, h * 0.55, w, h * 0.45)
    }
    drawboost(ctx, w, h) {
        ctx.fillStyle = "#6b5f78"
        ctx.fillRect(0, h * 0.55, w, h * 0.45)
    }

    handleButton(label) {
        if (label === "COMBAT") this.currentMenu = "fight"
        if (label === "SAC") this.currentMenu = "bag" 
        if (label === "POKEMON") this.currentMenu = "pokemon"
        if (label === "FUITE") window.dispatchEvent(new CustomEvent("endBattle"))

    }

    draw() {

        if (!this.field || !this.platform || !this.enemy_hp_bar || !this.pokemon_bar) return
        
        const ctx = this.ctx
        const w = this.canvas.width
        const h = this.canvas.height
        
        ctx.clearRect(0, 0, w, h)

        ctx.fillStyle = "#4a8f3f"
        ctx.fillRect(0, 0, w, h)

        ctx.drawImage(this.field, 0, 0, w, h * 0.6)

        ctx.drawImage(this.platform, w * 0.48, h * 0.2, 800, 100)
        ctx.drawImage(this.enemy_hp_bar, w * 0.02, h * 0.04, 600, 120)

        ctx.drawImage(this.platform, w * 0.02, h * 0.42, 900, 100)
        ctx.drawImage(this.pokemon_bar, w * 0.55, h * 0.38, 600, 120)

        ctx.fillStyle = "#2d5a1b"
        ctx.fillRect(0, h * 0.55, w, h * 0.45)
        ctx.fillStyle = "#1a3a0f"
        ctx.fillRect(0, h * 0.55, w, 4)

        ctx.strokeStyle = "white"
        ctx.lineWidth = 3
        ctx.strokeRect(0, h * 0.55, w, h * 0.45)

        if (this.currentMenu === "main") this.drawButtons(ctx, w, h)
        else if (this.currentMenu === "bag") this.drawObjects(ctx, w, h)
        else if (this.currentMenu === "fight") this.drawAttacks(ctx, w, h)
        else if (this.currentMenu === "pokemon") this.drawTeam(ctx, w, h)


    if (this.enemySprite  && this.enemyDisplayHP > 0) {
        ctx.drawImage(this.enemySprite, w * 0.62, h * 0.08, 220, 220)
    }
    if (this.playerSprite) {
        ctx.drawImage(this.playerSprite, w * 0.18, h * 0.28, 220, 220)

        ctx.strokeStyle = "black"
        ctx.lineWidth = 2
        ctx.font = "bold 22px 'Press Start 2P'"
        ctx.strokeText(this.playerPokemon.pokemon, w * 0.622, h * 0.4352)
        ctx.fillStyle = "white"
        ctx.fillText(this.playerPokemon.pokemon, w * 0.62, h * 0.435)

        ctx.strokeText(`${this.playerPokemon.niveau}`, w * 0.812, h * 0.4352)
        ctx.fillText(`${this.playerPokemon.niveau}`, w * 0.81, h * 0.435)
    }
    
    ctx.strokeStyle = "black"
    ctx.font = "bold 18px 'Press Start 2P'"
    ctx.lineWidth = 3
    ctx.strokeText(this.encounter.pokemon, w * 0.04, h * 0.09)
    ctx.strokeText(`${this.encounter.niveau}`, w * 0.188, h * 0.085)
    ctx.fillStyle = "white"
    ctx.fillText(this.encounter.pokemon, w * 0.04, h * 0.085)
    ctx.fillText(`${this.encounter.niveau}`, w * 0.188, h * 0.085)

    if (this.playerMaxHP) {
        const barX = w * 0.726
        const barY = h * 0.458
        const barMaxWidth = w * 0.1179
        const barHeight = 7

        const hpPercent = this.playerDisplayHP / this.playerMaxHP
        const barColor = hpPercent > 0.5 ? "#00c800" : hpPercent > 0.2 ? "#f8d030" : "#f82800"

        ctx.fillStyle = barColor
        ctx.fillRect(barX, barY, barMaxWidth * hpPercent, barHeight)
    }
    if (this.enemyMaxHP) {
        const barX = w * 0.1177
        const barY = h * 0.11
        const barMaxWidth = w * 0.095
        const barHeight = 7

        const hpPercent = this.enemyDisplayHP / this.enemyMaxHP
        const barColor = hpPercent > 0.5 ? "#00c800" : hpPercent > 0.2 ? "#f8d030" : "#f82800"

        ctx.fillStyle = barColor
        ctx.fillRect(barX, barY, barMaxWidth * hpPercent, barHeight)
    }
}

    update() {
        if (this.enemyDisplayHP > this.enemyCurrentHP) {
            this.enemyDisplayHP -= 0.5
            if (this.enemyDisplayHP < this.enemyCurrentHP) this.enemyDisplayHP = this.enemyCurrentHP
        }
        if (this.playerDisplayHP > this.playerCurrentHP) {
            this.playerDisplayHP -= 0.5
            if (this.playerDisplayHP < this.playerCurrentHP) this.playerDisplayHP = this.playerCurrentHP
        }
        if ((this.enemyCurrentHP <= 0 && this.enemyDisplayHP <= 0 && !this.battleEnded) ||
            (this.playerCurrentHP <= 0 && this.playerDisplayHP <= 0 && !this.battleEnded)) {
            this.battleEnded = true
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent("endBattle"))
            }, 1000)
        }
    }
}