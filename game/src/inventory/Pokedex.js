export const PokedexMixin = {

    async fetchPokedex() {
        const res = await fetch("http://localhost:3000/api/pokedex")
        this.pokedexData = await res.json()
        for (const entry of this.pokedexData) {
            if (!this.pokedexSprites[entry.pokemonId]) {
                const img = new Image()
                img.src = `./assets/pokemon/dp/${entry.pokemonId}.png`
                img.onload = () => { this.pokedexSprites[entry.pokemonId] = img }
            }
        }
    },

    drawPokedex() {
        const ctx = this.ctx
        const w = this.canvas.width
        const h = this.canvas.height

        ctx.fillStyle = "#1a1a2e"
        ctx.fillRect(0, 0, w, h)

        ctx.fillStyle = "white"
        ctx.font = "bold 14px 'Press Start 2P'"
        ctx.textAlign = "center"
        ctx.fillText("POKÉDEX", w / 2, 40)

        const back = this.assets.get("back")
        if (back) ctx.drawImage(back, w - 80, 10, 60, 50)

        if (!this.pokedexData.length) {
            ctx.fillStyle = "rgba(255,255,255,0.5)"
            ctx.font = "10px 'Press Start 2P'"
            ctx.fillText("Aucun Pokémon vu", w / 2, h / 2)
            return
        }

        const cols = 6
        const cellW = w / cols
        const cellH = 100
        const startY = 70

        this.pokedexData.forEach((entry, i) => {
            const col = i % cols
            const row = Math.floor(i / cols)
            const x = col * cellW + cellW / 2
            const y = startY + row * cellH

            const sprite = this.pokedexSprites[entry.pokemonId]
            if (sprite) {
                ctx.drawImage(sprite, x - 32, y, 64, 64)
            } else {
                ctx.fillStyle = "rgba(255,255,255,0.1)"
                ctx.fillRect(x - 32, y, 64, 64)
            }

            ctx.fillStyle = "white"
            ctx.font = "7px 'Press Start 2P'"
            ctx.textAlign = "center"
            ctx.fillText(`#${String(entry.pokemonId).padStart(3, '0')}`, x, y + 72)
            ctx.fillText(entry.pokemon, x, y + 84)
        })
        ctx.textAlign = "left"
    }
}