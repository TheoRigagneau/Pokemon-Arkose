export default class Battle {
    constructor(ctx, canvas, encounter) {
        this.ctx = ctx
        this.canvas = canvas
        this.encounter = encounter
        this.enemyDisplayHP = this.enemyMaxHP
        window.addEventListener("keydown", (event) => {
        if (event.key === "a") {
            console.log("keydown battle", event.key)
            this.enemyCurrentHP -= 10
            if (this.enemyCurrentHP < 0) this.enemyCurrentHP = 0
        }
})
    }

    async init() {
        this.enemySprite = await this.loadImage(`./game/assets/pokemon/dp/${this.encounter.id}.png`)
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
        ctx.fillRect(0, h * 0.6, w, h * 0.4)
        ctx.fillStyle = "#1a3a0f"
        ctx.fillRect(0, h * 0.6, w, 4)

        if (this.enemySprite  && this.enemyDisplayHP > 0) {
            ctx.drawImage(this.enemySprite, w * 0.62, h * 0.08, 220, 220)
        }
        ctx.strokeStyle = "black"
        ctx.lineWidth = 3
        ctx.strokeText(this.encounter.pokemon, w * 0.04, h * 0.09)
        ctx.strokeText(`${this.encounter.niveau}`, w * 0.188, h * 0.085)
        ctx.fillStyle = "white"
        ctx.font = "bold 18px 'Press Start 2P'"
        ctx.fillText(this.encounter.pokemon, w * 0.04, h * 0.085)
        ctx.fillText(`${this.encounter.niveau}`, w * 0.188, h * 0.085)

        if (this.enemyMaxHP) {
            const barX = w * 0.02 + 600 * 0.311
            const barY = h * 0.04 + 120 * 0.535
            const barMaxWidth = 600 * 0.305
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
        if (this.enemyCurrentHP <= 0 && this.enemyDisplayHP <= 0 && !this.battleEnded) {
            this.battleEnded = true
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent("endBattle"))
            }, 1000)
}
    }
}