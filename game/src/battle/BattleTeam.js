export const BattleTeamMixin = {
    //fait les slots de la team en fonction des pokés morts et des slots vides
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
    },

    drawTeam(ctx, w, h) {
        //crée la page team
        const item = this.selectedItem ? this.items?.find(i => i.name === this.selectedItem.itemName) : null

        ctx.fillStyle = "#1a1a2e"
        ctx.fillRect(0, 0, w, h)

        ctx.fillStyle = "white"
        ctx.font = "bold 18px 'Press Start 2P'"
        ctx.textAlign = "center"
        ctx.fillText("EQUIPE", w / 2, h * 0.06)
        ctx.textAlign = "left"

        if (!this.teamData) return
        //bouton cliquable pour aller sur le pokémon
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
            //slot vide
            if (!poke) {
                this.drawSlot(ctx, slot.x, slot.y, sw, sh, false)
                continue
            }

            const isDead = (poke.currentHP ?? 0) <= 0
            const isFull = (poke.currentHP ?? 0) >= this.playerMaxHP
            const isUsable = !item || 
                (item.type === "heal" && !isDead && !isFull) ||
                (item.type === "revive" && isDead)

            ctx.globalAlpha = isUsable ? 1.0 : 0.4
            //slot en fonction de l'état du pokémon
            this.drawSlot(ctx, slot.x, slot.y, sw, sh, isUsable && !isDead)

            const spriteSize = sh * 0.85
            const sprite = this.teamSprites?.[poke.id]
            //sprite des poke
            ctx.drawImage(sprite, slot.x + 8, slot.y + sh * 0.08, spriteSize, spriteSize)

            const textX = slot.x + spriteSize + 16
            ctx.fillStyle = "white"
            ctx.font = "bold 13px 'Press Start 2P'"
            ctx.fillText(poke.pokemon, textX, slot.y + sh * 0.28)

            ctx.font = "10px 'Press Start 2P'"
            ctx.fillText(`Nv.${poke.niveau}`, textX, slot.y + sh * 0.5)

            const currentHP = poke._id === this.playerPokemon._id ? this.playerCurrentHP : (poke.currentHP ?? this.playerMaxHP)
            const maxHP = poke._id === this.playerPokemon._id ? this.playerMaxHP : (poke.maxHP ?? this.playerMaxHP)
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
        }
    },
    //page sur laquelle on voit les infos du poké
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
        //crée un bouton pour envoyer le poke au combat si ce n'est pas celui déja présent
        if (poke._id !== this.playerPokemon._id) {
            this.drawSlot(ctx, w * 0.3, h * 0.85, w * 0.4, h * 0.08, true)
            ctx.fillStyle = "white"
            ctx.font = "bold 13px 'Press Start 2P'"
            ctx.textAlign = "center"
            ctx.fillText("ENVOYER AU COMBAT", w * 0.5, h * 0.905)
            ctx.textAlign = "left"
        }

        if (this.back) ctx.drawImage(this.back, w * 0.91, h * 0.02, w * 0.08, h * 0.06)
    },

    async switchPokemon(newPoke) {
        await this.saveHP()
        this.playerPokemon = newPoke
        this.playerSprite = await this.loadImage(`./assets/pokemon/dp/back/${newPoke.id}.png`)

        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${newPoke.id}`)
        const data = await res.json()
        const stats = data.stats
        //load les stats du nouveau pokémon
        const calcStat = (base, niveau) => Math.floor((2 * base * niveau) / 100) + 5
        this.playerMaxHP          = Math.floor((2 * stats.find(s => s.stat.name === "hp").base_stat * newPoke.niveau) / 100) + newPoke.niveau + 10
        this.playerAttack         = calcStat(stats.find(s => s.stat.name === "attack").base_stat, newPoke.niveau)
        this.playerSpecialAttack  = calcStat(stats.find(s => s.stat.name === "special-attack").base_stat, newPoke.niveau)
        this.playerDefense        = calcStat(stats.find(s => s.stat.name === "defense").base_stat, newPoke.niveau)
        this.playerSpecialDefense = calcStat(stats.find(s => s.stat.name === "special-defense").base_stat, newPoke.niveau)
        this.playerSpeed          = calcStat(stats.find(s => s.stat.name === "speed").base_stat, newPoke.niveau)

        this.playerTypes          = data.types.map(t => t.type.name)
        this.playerCurrentHP      = newPoke.currentHP ?? this.playerMaxHP
        this.playerDisplayHP      = this.playerCurrentHP
        this.playerXpDisplay      = newPoke.xp || 0

        this.moveTypes = {}
        this.movePower = {}
        this.moveClass = {}
        await Promise.all(newPoke.moves.map(async (move) => {
            const res  = await fetch(`https://pokeapi.co/api/v2/move/${move}`)
            const data = await res.json()
            this.moveTypes[move] = data.type.name
            this.movePower[move] = data.power || 0
            this.moveClass[move] = data.damage_class.name
        }))

        this.selectedPokemon = null
        this.forcedSwitch = false
        this.playerDefeated = false
        this.currentMenu = "main"

        const enemyMove = this.getBestEnemyMove()
        this.animating = true
        await this.attack(enemyMove, true)
        this.animating = false
        this.message = null
    }
}