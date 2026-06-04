export default class Battle {

    constructor(ctx, canvas, encounter) {
        this.ctx = ctx
        this.canvas = canvas
        this.encounter = encounter
        this.enemyDisplayHP = this.enemyMaxHP
        this.currentMenu = "main"
        this.message = null
        this.messageTimer = 0
        this.ready = false
        this.animating = false

        this.keyHandler = (event) => {
            if (event.key === "a") {
                this.enemyCurrentHP -= 10
                if (this.enemyCurrentHP < 0) this.enemyCurrentHP = 0
            }
            if (event.key === "v") {
                this.playerCurrentHP -= 10
                if (this.playerCurrentHP < 0) this.playerCurrentHP = 0
            }
        }
        window.addEventListener("keydown", this.keyHandler)
        this.clickHandler = (e) => {
            if (this.animating) return
            const rect = this.canvas.getBoundingClientRect()
            const mouseX = e.clientX - rect.left
            const mouseY = e.clientY - rect.top
            
            const w = this.canvas.width
            const h = this.canvas.height
            const bw = w * 0.32
            const bh = h * 0.1

            if (this.currentMenu !== "main" && this.currentMenu !== "fight" && this.currentMenu !== "pokemon") {
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
            if (this.currentMenu === "fight") {
                const backW = w * 0.08
                const backH = h * 0.11
                const backX = w * 0.46
                const backY = h * 0.845

                if (mouseX >= backX && mouseX <= backX + backW &&
                    mouseY >= backY && mouseY <= backY + backH) {
                    this.currentMenu = "main"
                    return
                }

                const positions = [
                    { x: w * 0.25, y: h * 0.76 },
                    { x: w * 0.75, y: h * 0.76 },
                    { x: w * 0.25, y: h * 0.91 },
                    { x: w * 0.75, y: h * 0.91 },
                ]
                const bw = w * 0.38
                const bh = h * 0.11

                for (let i = 0; i < this.playerPokemon.moves.length; i++) {
                    const bx = positions[i].x - bw / 2
                    const by = positions[i].y - bh / 2

                    if (mouseX >= bx && mouseX <= bx + bw &&
                        mouseY >= by && mouseY <= by + bh) {
                        this.useMove(this.playerPokemon.moves[i])
                        this.currentMenu = "main"
                        return
                    }
                }
                return
            }

            if (this.currentMenu === "main") {
                
                const buttons = [
                    { label: "COMBAT",  x: w * 0.3, y: h * 0.79 },
                    { label: "SAC",     x: w * 0.7, y: h * 0.79 },
                    { label: "POKEMON", x: w * 0.3, y: h * 0.92 },
                    { label: "FUITE",   x: w * 0.7, y: h * 0.92 },
                ]
                
                for (const btn of buttons) {
                    if (mouseX >= btn.x - bw/2 && mouseX <= btn.x + bw/2 &&
                        mouseY >= btn.y - bh/2 && mouseY <= btn.y + bh/2) {
                        this.handleButton(btn.label)
                    }
                }
            }
            if (this.currentMenu === "pokemon") {
                const backX = w * 0.91
                const backY = h * 0.02
                const backW = w * 0.08
                const backH = h * 0.06


                if (mouseX >= backX && mouseX <= backX + backW &&
                    mouseY >= backY && mouseY <= backY + backH) {
                    if (this.selectedPokemon) {
                        this.selectedPokemon = null
                    } else if (!this.forcedSwitch) {
                        this.currentMenu = "main"
                    }
                    return
                }

                if (!this.selectedPokemon) {
                    const slots = [
                        { x: w * 0.02, y: h * 0.1 },
                        { x: w * 0.52, y: h * 0.1 },
                        { x: w * 0.02, y: h * 0.4 },
                        { x: w * 0.52, y: h * 0.4 },
                        { x: w * 0.02, y: h * 0.7 },
                        { x: w * 0.52, y: h * 0.7 },
                    ]
                    const sw = w * 0.46
                    const sh = h * 0.26

                    for (let i = 0; i < this.teamData.length; i++) {

                        if (!this.teamData[i]) continue
                        const isDead = (this.teamData[i].currentHP ?? 0) <= 0
                        if (isDead) continue

                        if (mouseX >= slots[i].x && mouseX <= slots[i].x + sw &&
                            mouseY >= slots[i].y && mouseY <= slots[i].y + sh) {
                            this.selectedPokemon = this.teamData[i]
                            return
                        }
                    }
                } else {
                    const btnX = w * 0.3
                    const btnY = h * 0.85
                    const btnW = w * 0.4
                    const btnH = h * 0.08

                    if (mouseX >= btnX && mouseX <= btnX + btnW &&
                        mouseY >= btnY && mouseY <= btnY + btnH) {
                        this.switchPokemon(this.selectedPokemon)
                        return
                    }
                }
                return
            }
        }
        this.canvas.addEventListener("click", this.clickHandler)
    }


    async init() {
        this.field              = await this.loadImage("./assets/battle/field_day.png")
        this.platform           = await this.loadImage("./assets/battle/grass_platform.png")
        this.enemy_hp_bar       = await this.loadImage("./assets/battle/enemy_hp_bar.png")
        this.pokemon_bar        = await this.loadImage("./assets/battle/player_hp_bar.png")
        this.slot_obj           = await this.loadImage("./assets/battle/fond_objets.png")
        this.background         = await this.loadImage("./assets/battle/bg_obj.png")
        this.attackSprite       = await this.loadImage("./assets/battle/attack_sprite.png")
        this.back               = await this.loadImage("./assets/battle/back.png")
        this.waitingScreen      = await this.loadImage("./assets/battle/waitingscreen.png")

        this.enemySprite        = await this.loadImage(`./assets/pokemon/dp/shiny/${this.encounter.id}.png`)
        const enemyResponse     = await fetch(`https://pokeapi.co/api/v2/pokemon/${this.encounter.id}`)
        const enemyData         = await enemyResponse.json()
        const enemyStats        = enemyData.stats
        this.enemyTypes             = enemyData.types.map(t => t.type.name)
        this.enemyMaxHP             = enemyStats.find(s => s.stat.name === "hp").base_stat
        this.enemyAttack            = enemyStats.find(s => s.stat.name === "attack").base_stat
        this.enemyDefense           = enemyStats.find(s => s.stat.name === "defense").base_stat
        this.enemySpecialAttack     = enemyStats.find(s => s.stat.name === "special-attack").base_stat
        this.enemySpecialDefense    = enemyStats.find(s => s.stat.name === "special-defense").base_stat
        this.enemySpeed             = enemyStats.find(s => s.stat.name === "speed").base_stat
        this.enemyMovePower = {}
        this.enemyMoveClass = {}
        this.enemyMoveTypes = {}

        this.enemyMoves = enemyData.moves.filter(m => m.version_group_details.some(
                v => v.move_learn_method.name === "level-up" && v.level_learned_at <= this.encounter.niveau &&
                v.level_learned_at > 0)).map(m => m.move.name).slice(0, 4)
        if (this.enemyMoves.length === 0) {
            this.enemyMoves = enemyData.moves.slice(0, 1).map(m => m.move.name)
        }
        await Promise.all(this.enemyMoves.map(async (move) => {
            const res = await fetch(`https://pokeapi.co/api/v2/move/${move}`)
            const data = await res.json()
            this.enemyMovePower[move] = data.power || 0
            this.enemyMoveClass[move] = data.damage_class.name
            this.enemyMoveTypes[move] = data.type.name
        }))

        this.enemyBaseXP = enemyData.base_experience
        this.xpWin = Math.floor((this.enemyBaseXP * this.encounter.niveau) / 7)
        const xp_win = (this.enemyBaseXP * this.encounter.niveau) / 7
        this.enemyDisplayHP     = this.enemyMaxHP
        this.enemyCurrentHP     = this.enemyMaxHP
        this.battleEnded        = false

        const teamResponse = await fetch("http://localhost:3000/api/team")
        this.teamData = await teamResponse.json()
        this.teamSprites = {}
        for (const poke of this.teamData) {
            const img = await this.loadImage(`./assets/pokemon/dp/${poke.id}.png`)
            this.teamSprites[poke.id] = img
        }
        if (this.teamData.length > 0) {
            this.playerPokemon = this.teamData.find(p => (p.currentHP ?? 1) > 0) || this.teamData[0]
            this.playerSprite  = await this.loadImage(`./assets/pokemon/dp/back/${this.playerPokemon.id}.png`)

            const playerResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${this.playerPokemon.id}`)
            const playerData = await playerResponse.json()
            const playerStats = playerData.stats
            this.playerMaxHP        = playerStats.find(s => s.stat.name === "hp").base_stat
            this.playerAttack       = playerStats.find(s => s.stat.name === "attack").base_stat
            this.playerSpecialAttack = playerStats.find(s => s.stat.name === "special-attack").base_stat
            this.playerDefense = playerStats.find(s => s.stat.name === "defense").base_stat
            this.playerSpecialDefense = playerStats.find(s => s.stat.name === "special-defense").base_stat
            this.playerSpeed         = playerStats.find(s => s.stat.name === "speed").base_stat
            this.playerTypes = playerData.types.map(t => t.type.name)
            this.playerCurrentHP = this.playerPokemon.currentHP ?? this.playerMaxHP
            this.playerDisplayHP = this.playerCurrentHP
            this.playerXpDisplay = this.playerPokemon.xp || 0
            this.selectedPokemon = null
            this.moveTypes = {}
            this.movePower = {}
            this.moveClass = {}
            await Promise.all(this.playerPokemon.moves.map(async (move) => {
                const res  = await fetch(`https://pokeapi.co/api/v2/move/${move}`)
                const data = await res.json()
                this.moveTypes[move] = data.type.name
                this.movePower[move] = data.power || 0
                this.moveClass[move] = data.damage_class.name
            }))
        }
        this.ready = true
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

    destroy() {
        this.canvas.removeEventListener("click", this.clickHandler)
        window.removeEventListener("keydown", this.keyHandler)
    }

    handleButton(label) {
        this.message = null
        if (label === "COMBAT")  this.currentMenu = "fight"
        if (label === "SAC")     this.currentMenu = "bag"
        if (label === "POKEMON") this.currentMenu = "pokemon"
        if (label === "FUITE")   {
            this.saveHP()
            window.dispatchEvent(new CustomEvent("endBattle"))
        }
    }

    getBestEnemyMove() {
        let bestMove = this.enemyMoves[0]
        let bestDamage = 0

        for (const move of this.enemyMoves) {
            const power = this.enemyMovePower[move] || 0
            if (power === 0) continue

            const isSpecial = this.enemyMoveClass[move] === "special"
            const atk = isSpecial ? this.enemySpecialAttack : this.enemyAttack
            const def = isSpecial ? this.playerSpecialDefense : this.playerDefense

            const damage = Math.floor(
                ((2 * this.encounter.niveau / 5 + 2) * atk / def / 50 + 2)
            )

            if (damage > bestDamage) {
                bestDamage = damage
                bestMove = move
            }
        }

        return bestMove
    }

    async attack(moveName, isEnemy = false) {
        const attacker = isEnemy ? `${this.encounter.pokemon} ennemi` : this.playerPokemon.pokemon
        const niveau = isEnemy ? this.encounter.niveau : this.playerPokemon.niveau
        const atk = isEnemy ? this.enemyAttack : this.playerAttack
        const atkSpe = isEnemy ? this.enemySpecialAttack : this.playerSpecialAttack
        const def = isEnemy ? this.playerDefense : this.enemyDefense
        const defSpe = isEnemy ? this.playerSpecialDefense : this.enemySpecialDefense

        const isSpecial = isEnemy ? this.enemyMoveClass[moveName] === "special" : this.moveClass[moveName] === "special"
        const finalAtk = isSpecial ? atkSpe : atk
        const finalDef = isSpecial ? defSpe : def

        const moveType = isEnemy ? this.enemyMoveTypes[moveName] : this.moveTypes[moveName]
        const defenderTypes = isEnemy ? this.playerTypes : this.enemyTypes
        const attackerTypes = isEnemy ? this.enemyTypes : this.playerTypes

        const power = isEnemy ? this.enemyMovePower[moveName] : this.movePower[moveName]
        const effectiveness = await this.getEffectiveness(moveType, defenderTypes)
        const stab = attackerTypes?.includes(moveType) ? 1.5 : 1
        const damage = Math.floor(
           ((2 * niveau / 5 + 2) * power * finalAtk / finalDef / 50 + 2) * effectiveness * stab )

        console.log("movePower:", this.movePower, "moveName:", moveName)
        console.log("power:", this.movePower[moveName], "niveau:", niveau, "atk:", finalAtk, "def:", finalDef, "effectiveness:", effectiveness, "stab:", stab, "damage:", damage)
        this.message = `${attacker} utilise ${moveName.replace(/-/g, ' ').toUpperCase()} !`
        
        if (isEnemy) {
            this.playerCurrentHP -= damage
            if (this.playerCurrentHP < 0) this.playerCurrentHP = 0
        } else {
            this.enemyCurrentHP -= damage
            if (this.enemyCurrentHP < 0) this.enemyCurrentHP = 0
        }

        await new Promise(r => setTimeout(r, 1000))

        if (effectiveness > 1) this.message = "C'est super efficace !"
        else if (effectiveness < 1) this.message = "Ce n'est pas très efficace..."
        await new Promise(r => setTimeout(r, 1000))


    }


    async capture() {
        await this.saveHP()
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${this.encounter.id}`)
        const data = await response.json()
        const moves = data.moves.slice(0, 4).map(m => m.move.name)
        const maxHP = data.stats.find(s => s.stat.name === "hp").base_stat

        await fetch("http://localhost:3000/api/team", {
            method: "POST",
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({
                pokemon: this.encounter.pokemon,
                id: this.encounter.id,
                niveau: this.encounter.niveau,
                moves: moves,
                xp: 0,
                currentHP: maxHP  
            })
        })
        window.dispatchEvent(new CustomEvent("endBattle"))
    }

    async useMove(moveName) {
        this.animating = true
        const power = this.movePower[moveName]
        if (!power) {
            this.animating = false
            return
        }

        const playerFirst = this.playerSpeed >= this.enemySpeed
        const enemyMove = this.getBestEnemyMove()

        if (playerFirst) {
            await this.attack(moveName, false)
            if (this.enemyCurrentHP > 0) await this.attack(enemyMove, true)
        } else {
            await this.attack(enemyMove, true)
            if (this.playerCurrentHP > 0) await this.attack(moveName, false)
        }

        this.animating = false
        this.message = null
    }

    async getEffectiveness(moveType, defenderTypes) {
        let multiplier = 1
        const res  = await fetch(`https://pokeapi.co/api/v2/type/${moveType}`)
        const data = await res.json()
        const relations = data.damage_relations

        for (const defType of defenderTypes) {
            if (relations.double_damage_to.find(t => t.name === defType)) multiplier *= 2
            if (relations.half_damage_to.find(t => t.name === defType))   multiplier *= 0.5
            if (relations.no_damage_to.find(t => t.name === defType))     multiplier *= 0
        }
        return multiplier
    }

    async giveXP(amount) {
        const currentXP = this.playerPokemon.xp || 0
        let newXP = currentXP + amount
        let newNiveau = this.playerPokemon.niveau
        const xpNeeded = Math.pow(newNiveau + 1, 2) * 5
        const levelUp = newXP >= xpNeeded

        this.playerXpDisplay = currentXP

        if (levelUp) {
            this.xpTarget = xpNeeded
            await new Promise(resolve => {
                const wait = setInterval(() => {
                    if (this.playerXpDisplay >= xpNeeded) {
                        clearInterval(wait)
                        this.playerXpDisplay = 0
                        resolve()
                    }
                }, 16)
            })
            newXP = 0
            newNiveau++
        }

        this.xpTarget = newXP
        this.playerPokemon.xp = newXP
        this.playerPokemon.niveau = newNiveau

        await fetch(`http://localhost:3000/api/team/${this.playerPokemon._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ xp: newXP, niveau: newNiveau })
        })
    }

    async saveHP() {
        if (!this.playerPokemon) return
        await fetch(`http://localhost:3000/api/team/${this.playerPokemon._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentHP: this.playerCurrentHP })
        })
    } 


    draw() {
        if (!this.field || !this.platform || !this.enemy_hp_bar || !this.pokemon_bar || !this.ready) return
        
        const ctx = this.ctx
        const w   = this.canvas.width
        const h   = this.canvas.height
        
        ctx.clearRect(0, 0, w, h)

        ctx.fillStyle = "#4a8f3f"
        ctx.fillRect(0, 0, w, h)
        ctx.drawImage(this.field, 0, 0, w, h * 0.6)

        ctx.drawImage(this.platform,    w * 0.48, h * 0.2, 800, 100)
        ctx.drawImage(this.enemy_hp_bar, w * 0.02, h * 0.04, 600, 120)
        ctx.drawImage(this.platform,    w * 0.02, h * 0.42, 900, 100)
        ctx.drawImage(this.pokemon_bar,  w * 0.55, h * 0.38, 600, 120)

        ctx.fillStyle = "#2d5a1b"
        ctx.fillRect(0, h * 0.55, w, h * 0.45)
        ctx.fillStyle = "#1a3a0f"
        ctx.fillRect(0, h * 0.55, w, 4)
        ctx.strokeStyle = "white"
        ctx.lineWidth = 3
        ctx.strokeRect(0, h * 0.55, w, h * 0.45)

        if (this.currentMenu === "main") { 
            this.drawMessage(ctx, w, h) 
            this.drawButtons(ctx, w, h) 
        }

        else if (this.currentMenu === "fight"){
            this.drawAttacks(ctx, w, h) 
            this.drawMessage(ctx, w, h)
        }

        else if (this.currentMenu === "bag")     this.drawObjects(ctx, w, h)
        else if (this.currentMenu === "pokemon") {
            this.drawTeam(ctx, w, h)
            return 
        }

        if (this.enemySprite && this.enemyDisplayHP > 0) {
            ctx.drawImage(this.enemySprite, w * 0.62, h * 0.08, 220, 220)
        }
        if (this.playerSprite) {
            ctx.drawImage(this.playerSprite, w * 0.18, h * 0.28, 220, 220)
        }

        ctx.strokeStyle = "black"
        ctx.font = "bold 18px 'Press Start 2P'"
        ctx.lineWidth = 3
        ctx.strokeText(this.encounter.pokemon, w * 0.04, h * 0.09)
        ctx.strokeText(`${this.encounter.niveau}`, w * 0.188, h * 0.085)
        ctx.fillStyle = "white"
        ctx.fillText(this.encounter.pokemon, w * 0.04, h * 0.085)
        ctx.fillText(`${this.encounter.niveau}`, w * 0.188, h * 0.085)

        if (this.playerSprite) {
            ctx.strokeStyle = "black"
            ctx.lineWidth = 2
            ctx.font = "bold 22px 'Press Start 2P'"
            ctx.strokeText(this.playerPokemon.pokemon, w * 0.622, h * 0.4352)
            ctx.fillStyle = "white"
            ctx.fillText(this.playerPokemon.pokemon, w * 0.62, h * 0.435)
            ctx.strokeText(`${this.playerPokemon.niveau}`, w * 0.812, h * 0.4352)
            ctx.fillText(`${this.playerPokemon.niveau}`, w * 0.81, h * 0.435)
        }

        if (this.playerMaxHP) {
            console.log("playerMaxHP:", this.playerMaxHP, "playerDisplayHP:", this.playerDisplayHP)
            const barX = w * 0.726
            const barY = h * 0.458
            const barMaxWidth = w * 0.1179
            const barHeight = 7
            const hpPercent = this.playerDisplayHP / this.playerMaxHP
            const barColor = hpPercent > 0.5 ? "#00c800" : hpPercent > 0.2 ? "#f8d030" : "#f82800"
            ctx.fillStyle = barColor
            ctx.fillRect(barX, barY, barMaxWidth * hpPercent, barHeight)
        }

        if (this.playerPokemon?.xp !== undefined) {
            const currentLevel = this.playerPokemon.niveau
            const xpNeeded = Math.pow(currentLevel + 1, 2) * 5
            const xpProgress = this.playerXpDisplay / xpNeeded

            const barX = w * 0.626
            const barY = h * 0.5301
            const barMaxWidth = w * 0.29    
            const barHeight = 6

            ctx.fillStyle = "#4080f0"
            ctx.fillRect(barX, barY, barMaxWidth * Math.max(0, Math.min(1, xpProgress)), barHeight)
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
        if (this.animating) {
            if (this.waitingScreen) {
                ctx.drawImage(this.waitingScreen, 0, h * 0.55, w, h * 0.45)
            } else {
                ctx.fillStyle = "#1a1a2e"
                ctx.fillRect(0, h * 0.55, w, h * 0.45)
            }
            ctx.fillStyle = "#1a3a0f"
            ctx.fillRect(0, h * 0.55, w, 4)
            ctx.strokeStyle = "white"
            ctx.lineWidth = 3
            ctx.strokeRect(0, h * 0.55, w, h * 0.45)
            this.drawMessage(ctx, w, h)
        }
    }

    drawButtons(ctx, w, h) {
        const buttons = [
            { label: "COMBAT",  color: "#e05555", shadow: "#a03030", x: w * 0.3, y: h * 0.76 },
            { label: "SAC",     color: "#d4a020", shadow: "#9a6e10", x: w * 0.7, y: h * 0.76 },
            { label: "POKEMON", color: "#50a850", shadow: "#307030", x: w * 0.3, y: h * 0.9 },
            { label: "FUITE",   color: "#4080d0", shadow: "#205090", x: w * 0.7, y: h * 0.9 },
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

        const TYPE_COLORS = {
            normal:   { color: "#A8A878", shadow: "#6D6D4E" },
            fire:     { color: "#F08030", shadow: "#9C531F" },
            water:    { color: "#6890F0", shadow: "#445E9C" },
            grass:    { color: "#78C850", shadow: "#4E8234" },
            electric: { color: "#F8D030", shadow: "#A1871F" },
            ice:      { color: "#98D8D8", shadow: "#638D8D" },
            fighting: { color: "#C03028", shadow: "#7D1F1A" },
            poison:   { color: "#A040A0", shadow: "#682A68" },
            ground:   { color: "#E0C068", shadow: "#927D44" },
            flying:   { color: "#A890F0", shadow: "#6D5E9C" },
            psychic:  { color: "#F85888", shadow: "#A13959" },
            bug:      { color: "#A8B820", shadow: "#6D7815" },
            rock:     { color: "#B8A038", shadow: "#786824" },
            ghost:    { color: "#705898", shadow: "#493963" },
            dragon:   { color: "#7038F8", shadow: "#4924A1" },
            dark:     { color: "#705848", shadow: "#49392F" },
            steel:    { color: "#B8B8D0", shadow: "#787887" },
            fairy:    { color: "#EE99AC", shadow: "#9B6470" },
        }

        const positions = [
            { x: w * 0.25, y: h * 0.76 },
            { x: w * 0.75, y: h * 0.76 },
            { x: w * 0.25, y: h * 0.91 },
            { x: w * 0.75, y: h * 0.91 },
        ]
        const bw = w * 0.38
        const bh = h * 0.11

        for (let i = 0; i < this.playerPokemon.moves.length; i++) {
            const bx = positions[i].x - bw / 2
            const by = positions[i].y - bh / 2

            const type   = this.moveTypes?.[this.playerPokemon.moves[i]] || "normal"
            const colors = TYPE_COLORS[type] || TYPE_COLORS.normal

            ctx.fillStyle = colors.shadow
            ctx.beginPath()
            ctx.roundRect(bx + 4, by + 6, bw, bh, 12)
            ctx.fill()

            ctx.fillStyle = colors.color
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

        const backW = w * 0.08
        const backH = h * 0.11
        const backX = w * 0.46
        const backY = h * 0.845

        if (this.back) {
            ctx.drawImage(this.back, backX, backY, backW, backH)
        }
    }

    drawSlot(ctx, x, y, w, h, isActive = false) {
        const radius = 16
        
        ctx.fillStyle = isActive ? "#1a4a8a" : "#2a2a3a"
        ctx.beginPath()
        ctx.roundRect(x + 4, y + 4, w, h, radius)
        ctx.fill()

        const gradient = ctx.createLinearGradient(x, y, x, y + h)
        if (isActive) {
            gradient.addColorStop(0, "#5090d0")
            gradient.addColorStop(1, "#2060a0")
        } else {
            gradient.addColorStop(0, "#4a4a5a")
            gradient.addColorStop(1, "#2a2a3a")
        }
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.roundRect(x, y, w, h, radius)
        ctx.fill()

        ctx.fillStyle = "rgba(255,255,255,0.15)"
        ctx.beginPath()
        ctx.roundRect(x + 6, y + 4, w - 12, h * 0.35, radius)
        ctx.fill()

        ctx.strokeStyle = isActive ? "#80b8f0" : "#505060"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.roundRect(x, y, w, h, radius)
        ctx.stroke()
    }

    drawPokemonDetail(ctx, w, h, poke) {
        ctx.fillStyle = "#1a1a2e"
        ctx.fillRect(0, 0, w, h)

        const sprite = this.teamSprites?.[poke.id]
        if (sprite) ctx.drawImage(sprite, w * 0.05, h * 0.1, h * 0.45, h * 0.45)

        ctx.fillStyle = "white"
        ctx.font = "bold 22px 'Press Start 2P'"
        ctx.fillText(poke.pokemon, w * 0.4, h * 0.18)
        ctx.font = "14px 'Press Start 2P'"
        ctx.fillText(`Niveau ${poke.niveau}`, w * 0.4, h * 0.28)

        const currentHP = poke._id === this.playerPokemon._id ? this.playerCurrentHP : (poke.currentHP ?? 0)
        ctx.fillText(`PV : ${currentHP} / ${this.playerMaxHP}`, w * 0.4, h * 0.38)

        ctx.fillText(`XP : ${poke.xp ?? 0}`, w * 0.4, h * 0.46)

        ctx.font = "bold 13px 'Press Start 2P'"
        ctx.fillText("Attaques :", w * 0.05, h * 0.63)
        ctx.font = "11px 'Press Start 2P'"
        poke.moves.forEach((move, i) => {
            ctx.fillText(`- ${move.replace(/-/g, ' ').toUpperCase()}`, w * 0.05, h * 0.71 + i * h * 0.07)
        })

        if (poke._id !== this.playerPokemon._id) {
            this.drawSlot(ctx, w * 0.3, h * 0.85, w * 0.4, h * 0.08, true)
            ctx.fillStyle = "white"
            ctx.font = "bold 13px 'Press Start 2P'"
            ctx.textAlign = "center"
            ctx.fillText("ENVOYER AU COMBAT", w * 0.5, h * 0.905)
            ctx.textAlign = "left"
        }

        if (this.back) ctx.drawImage(this.back, w * 0.91, h * 0.02, w * 0.08, h * 0.06)
    }

    async switchPokemon(newPoke) {
        await this.saveHP()
        this.playerPokemon = newPoke
        this.playerSprite = await this.loadImage(`./assets/pokemon/dp/back/${newPoke.id}.png`)

        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${newPoke.id}`)
        const data = await res.json()
        const stats = data.stats
        this.playerMaxHP = stats.find(s => s.stat.name === "hp").base_stat
        this.playerAttack = stats.find(s => s.stat.name === "attack").base_stat
        this.playerSpecialAttack = stats.find(s => s.stat.name === "special-attack").base_stat
        this.playerDefense = stats.find(s => s.stat.name === "defense").base_stat
        this.playerSpecialDefense = stats.find(s => s.stat.name === "special-defense").base_stat
        this.playerSpeed = stats.find(s => s.stat.name === "speed").base_stat
        this.playerTypes = data.types.map(t => t.type.name)
        this.playerCurrentHP = newPoke.currentHP ?? this.playerMaxHP
        this.playerDisplayHP = this.playerCurrentHP
        this.playerXpDisplay = newPoke.xp || 0

        this.moveTypes = {}
        this.movePower = {}
        this.moveClass = {}
        await Promise.all(newPoke.moves.map(async (move) => {
            const res = await fetch(`https://pokeapi.co/api/v2/move/${move}`)
            const data = await res.json()
            this.moveTypes[move] = data.type.name
            this.movePower[move] = data.power || 0
            this.moveClass[move] = data.damage_class.name
        }))

        this.selectedPokemon = null
        this.currentMenu = "main"

        const enemyMove = this.getBestEnemyMove()
        this.animating = true
        await this.attack(enemyMove, true)
        this.animating = false
        this.message = null
        this.forcedSwitch = false
    }

    drawTeam(ctx, w, h) {

        ctx.fillStyle = "#1a1a2e"
        ctx.fillRect(0, 0, w, h)

        ctx.fillStyle = "white"
        ctx.font = "bold 18px 'Press Start 2P'"
        ctx.textAlign = "center"
        ctx.fillText("EQUIPE", w / 2, h * 0.06)
        ctx.textAlign = "left"

        if (!this.teamData) return

        const slots = [
            { x: w * 0.02, y: h * 0.1 },
            { x: w * 0.52, y: h * 0.1 },
            { x: w * 0.02, y: h * 0.4 },
            { x: w * 0.52, y: h * 0.4 },
            { x: w * 0.02, y: h * 0.7 },
            { x: w * 0.52, y: h * 0.7 },
        ]
        const sw = w * 0.46
        const sh = h * 0.26

        for (let i = 0; i < 6; i++) {
            const slot = slots[i]
            const poke = this.teamData[i]

            if (!poke) {
                this.drawSlot(ctx, slot.x, slot.y, sw, sh, false)
                continue
            }

            const isDead = (poke.currentHP ?? 0) <= 0
            
            if (isDead) ctx.globalAlpha = 0.4
            this.drawSlot(ctx, slot.x, slot.y, sw, sh, !isDead)

            const spriteSize = sh * 0.85
            const sprite = this.teamSprites?.[poke.id]
            if (sprite) ctx.drawImage(sprite, slot.x + 8, slot.y + sh * 0.08, spriteSize, spriteSize)

            const textX = slot.x + spriteSize + 16
            ctx.fillStyle = "white"
            ctx.font = "bold 13px 'Press Start 2P'"
            ctx.fillText(poke.pokemon, textX, slot.y + sh * 0.28)

            ctx.font = "10px 'Press Start 2P'"
            ctx.fillText(`Nv.${poke.niveau}`, textX, slot.y + sh * 0.5)

            const currentHP = poke._id === this.playerPokemon._id ? this.playerCurrentHP : (poke.currentHP ?? this.playerMaxHP)
            const maxHP = this.playerMaxHP ?? 1
            const hpPercent = Math.max(0, currentHP / maxHP)
            const barX = textX
            const barY = slot.y + sh * 0.65
            const barW = sw - spriteSize - 28

            ctx.fillStyle = "#303030"
            ctx.fillRect(barX, barY, barW, 7)
            ctx.fillStyle = hpPercent > 0.5 ? "#00c800" : hpPercent > 0.2 ? "#f8d030" : "#f82800"
            ctx.fillRect(barX, barY, barW * hpPercent, 7)

            ctx.fillStyle = "white"
            ctx.font = "9px 'Press Start 2P'"
            ctx.fillText(`${currentHP}/${maxHP}`, barX, slot.y + sh * 0.88)

            ctx.globalAlpha = 1.0
        }

        const backW = w * 0.08
        const backH = h * 0.06
        const backX = w * 0.91
        const backY = h * 0.02
        if (this.back) ctx.drawImage(this.back, backX, backY, backW, backH)

        if (this.selectedPokemon) {
            this.drawPokemonDetail(ctx, w, h, this.selectedPokemon)
            return
        }
    }

    drawHeal(ctx, w, h) {
        ctx.fillStyle = "#6b5f78"
        ctx.fillRect(0, h * 0.55, w, h * 0.45)
    }

    drawStatus(ctx, w, h) {
        ctx.fillStyle = "#6b5f78"
        ctx.fillRect(0, h * 0.55, w, h * 0.45)
    }

    drawBoost(ctx, w, h) {
        ctx.fillStyle = "#6b5f78"
        ctx.fillRect(0, h * 0.55, w, h * 0.45)
    }

    drawMessage(ctx, w, h) {
        const pad = 16
        const boxH = h * 0.12
        const boxX = w * 0.02
        const boxY = h * 0.56
        const boxW = w * 0.9

        ctx.fillStyle = "white"
    ctx.beginPath()
    ctx.roundRect(boxX, boxY, boxW, boxH, 6)
    ctx.fill()

    ctx.strokeStyle = "#4860f0"
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.roundRect(boxX, boxY, boxW, boxH, 6)
    ctx.stroke()

    ctx.strokeStyle = "#98b0ff"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(boxX + 6, boxY + 6, boxW - 12, boxH - 12, 3)
    ctx.stroke()

    ctx.fillStyle = "#1a1a2e"
    ctx.font = "bold 15px monospace"
    ctx.fillText(
    this.message ?? (this.animating ? "" : `Que doit faire ${this.playerPokemon?.pokemon ?? ""} ?`),boxX + 16, boxY + boxH / 2 + 6)
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
        if (this.xpTarget !== undefined && this.playerXpDisplay < this.xpTarget) {
            this.playerXpDisplay += 0.5
            if (this.playerXpDisplay > this.xpTarget) this.playerXpDisplay = this.xpTarget
        }

        if (this.messageTimer > 0) {
            this.messageTimer--
            if (this.messageTimer <= 0) this.message = null
        }

        if (this.playerCurrentHP <= 0 && !this.battleEnded && !this.playerDefeated) {
            this.playerDefeated = true
            const hasAlive = this.teamData?.some(p => 
                p._id !== this.playerPokemon._id && (p.currentHP ?? 0) > 0
            )
            
            if (hasAlive) {
                this.currentMenu = "pokemon"
                this.forcedSwitch = true
            } else {
                this.battleEnded = true
                this.saveHP()
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent("endBattle"))
                }, 1000)
            }
        }

        if (this.enemyCurrentHP <= 0 && !this.battleEnded) {
            this.battleEnded = true
            this.giveXP(this.xpWin)
            this.saveHP()
            
            const waitForXP = setInterval(() => {
                if (!this.animating && this.xpTarget !== undefined && 
                    Math.abs(this.playerXpDisplay - this.xpTarget) < 1) {
                    clearInterval(waitForXP)
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent("endBattle"))
                    }, 1000)
                }
            }, 16)
        }
    }
}