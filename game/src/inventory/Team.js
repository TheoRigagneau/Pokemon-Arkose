export const TeamMixin = {

    async fetchTeam() {
        const res = await fetch("http://localhost:3000/api/team")
        this.teamData = await res.json()
        for (const poke of this.teamData) {
            this.loadSprite(poke.id)
            if (!poke.maxHP) {
                const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${poke.id}`)
                const data = await pokeRes.json()
                poke.maxHP = data.stats.find(s => s.stat.name === "hp").base_stat
            }
        }
    },

    async loadSprite(id) {
        if (this.teamSprites[id]) return
        const img = new Image()
        img.src = `./assets/pokemon/dp/${id}.png`
        img.onload = () => { this.teamSprites[id] = img }
    },

    drawTeam() {
        const capitalize = name => name ? name.charAt(0).toUpperCase() + name.slice(1) : ""
        const ctx = this.ctx
        const w = this.canvas.width
        const h = this.canvas.height

        ctx.fillStyle = "rgba(20, 16, 30, 0.97)"
        ctx.fillRect(0, 0, w, h)

        ctx.fillStyle = "white"
        ctx.font = "bold 14px 'Press Start 2P'"
        ctx.textAlign = "center"
        ctx.fillText("ÉQUIPE", w / 2, 40)

        const back = this.assets.get("back")
        if (back) ctx.drawImage(back, w - 80, 10, 60, 50)

        if (!this.teamData?.length) {
            ctx.fillStyle = "rgba(255,255,255,0.5)"
            ctx.font = "10px 'Press Start 2P'"
            ctx.textAlign = "center"
            ctx.fillText("Aucun Pokémon", w / 2, h / 2)
            return
        }

        const slots = [
            { x: 10,        y: 70 },
            { x: w / 2 + 5, y: 70 },
            { x: 10,        y: 70 + h * 0.28 },
            { x: w / 2 + 5, y: 70 + h * 0.28 },
            { x: 10,        y: 70 + h * 0.56 },
            { x: w / 2 + 5, y: 70 + h * 0.56 },
        ]
        const sw = w / 2 - 15
        const sh = h * 0.24

        for (let i = 0; i < 6; i++) {
            const slot = slots[i]
            const poke = this.teamData[i]

            ctx.fillStyle = "#1a4a8a"
            ctx.beginPath()
            ctx.roundRect(slot.x + 4, slot.y + 4, sw, sh, 16)
            ctx.fill()

            const gradient = ctx.createLinearGradient(slot.x, slot.y, slot.x, slot.y + sh)
            gradient.addColorStop(0, "#5090d0")
            gradient.addColorStop(1, "#2060a0")
            ctx.fillStyle = poke ? gradient : "#2a2a3a"
            ctx.beginPath()
            ctx.roundRect(slot.x, slot.y, sw, sh, 16)
            ctx.fill()

            ctx.fillStyle = "rgba(255,255,255,0.15)"
            ctx.beginPath()
            ctx.roundRect(slot.x + 6, slot.y + 4, sw - 12, sh * 0.35, 16)
            ctx.fill()

            ctx.strokeStyle = poke ? "#80b8f0" : "#505060"
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.roundRect(slot.x, slot.y, sw, sh, 16)
            ctx.stroke()
            ctx.beginPath()
            ctx.roundRect(slot.x, slot.y, sw, sh, 10)
            ctx.fill()
            ctx.strokeStyle = "rgba(255,255,255,0.1)"
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.roundRect(slot.x, slot.y, sw, sh, 10)
            ctx.stroke()

            if (!poke) continue

            const isDead = (poke.currentHP ?? 0) <= 0
            if (isDead) ctx.globalAlpha = 0.4

            const sprite = this.teamSprites[poke.id]
            if (sprite) {
                ctx.drawImage(sprite, slot.x + 4, slot.y + 4, sh * 0.85, sh * 0.85)
            } else {
                this.loadSprite(poke.id)
            }

            const textX = slot.x + sh * 0.85 + 8
            ctx.fillStyle = "white"
            ctx.font = "bold 8px 'Press Start 2P'"
            ctx.textAlign = "left"
            ctx.fillText(capitalize(poke.pokemon), textX, slot.y + sh * 0.3)
            ctx.font = "7px 'Press Start 2P'"
            ctx.fillText(`Nv.${poke.niveau}`, textX, slot.y + sh * 0.5)

            const currentHP = poke.currentHP ?? 0
            const maxHP = poke.maxHP ?? 1
            const hpPct = Math.max(0, currentHP / maxHP)
            const barW = sw - sh * 0.85 - 16
            ctx.fillStyle = "#303030"
            ctx.fillRect(textX, slot.y + sh * 0.65, barW, 5)
            ctx.fillStyle = hpPct > 0.5 ? "#00c800" : hpPct > 0.2 ? "#f8d030" : "#f82800"
            ctx.fillRect(textX, slot.y + sh * 0.65, barW * hpPct, 5)

            ctx.fillStyle = "white"
            ctx.font = "6px 'Press Start 2P'"
            ctx.fillText(`${currentHP}/${maxHP}`, textX, slot.y + sh * 0.88)

            ctx.globalAlpha = 1.0
        }
        ctx.textAlign = "left"

        if (this.selectedPokemon) {
            this.drawPokemonDetail(this.selectedPokemon.poke, this.selectedPokemon.index)
        }
    },

    drawPokemonDetail(poke, index) {
        const ctx = this.ctx
        const w = this.canvas.width
        const h = this.canvas.height

        ctx.fillStyle = "rgba(20, 16, 30, 0.97)"
        ctx.fillRect(0, 0, w, h)

        const sprite = this.teamSprites[poke.id]
        if (sprite) ctx.drawImage(sprite, w * 0.05, h * 0.1, h * 0.4, h * 0.4)

        ctx.fillStyle = "white"
        ctx.font = "bold 18px 'Press Start 2P'"
        ctx.textAlign = "left"
        ctx.fillText(poke.pokemon, w * 0.35, h * 0.2)
        ctx.font = "12px 'Press Start 2P'"
        ctx.fillText(`Niveau ${poke.niveau}`, w * 0.35, h * 0.32)
        ctx.fillText(`PV : ${poke.currentHP} / ${poke.maxHP}`, w * 0.35, h * 0.42)
        ctx.fillText(`XP : ${poke.xp ?? 0}`, w * 0.35, h * 0.52)

        ctx.font = "bold 11px 'Press Start 2P'"
        ctx.fillText("Attaques :", w * 0.05, h * 0.62)
        ctx.font = "10px 'Press Start 2P'"
        poke.moves.forEach((move, i) => {
            ctx.fillText(`- ${move.replace(/-/g, ' ').toUpperCase()}`, w * 0.05, h * 0.7 + i * h * 0.07)
        })

        const back = this.assets.get("back")
        if (back) ctx.drawImage(back, w - 80, 10, 60, 50)
    }
}