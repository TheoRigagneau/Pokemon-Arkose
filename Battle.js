export default class Battle {
    constructor(ctx, canvas, encounter) {
        this.ctx = ctx
        this.canvas = canvas
        this.encounter = encounter
    }

    async init() {
        this.enemySprite = await this.loadImage(`./game/assets/pokemon/dp/${this.encounter.id}.png`)
        this.field = await this.loadImage("./game/assets/battle/field_day.png")
        this.platform = await this.loadImage("./game/assets/battle/grass_platform.png")
        this.enemy_hp_bar = await this.loadImage("./game/assets/battle/enemy_hp_bar.png")
        this.pokemon_bar = await this.loadImage("./game/assets/battle/player_hp_bar.png")
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
        console.log(this.field.naturalWidth, this.field.naturalHeight)
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

        if (this.enemySprite) {
            // Sprite ennemi sur sa plateforme
            ctx.drawImage(this.enemySprite, w * 0.62, h * 0.08, 220, 220)
            ctx.strokeStyle = "black"
            ctx.lineWidth = 3
            ctx.strokeText(this.encounter.pokemon, w * 0.04, h * 0.09)
            ctx.strokeText(`${this.encounter.niveau}`, w * 0.188, h * 0.085)
            ctx.fillStyle = "white"
            ctx.font = "bold 18px 'Press Start 2P'"
            ctx.fillText(this.encounter.pokemon, w * 0.04, h * 0.085)
            ctx.fillText(`${this.encounter.niveau}`, w * 0.188, h * 0.085)
        }
            }

    update() {
        // C'est l'heure du DU-DU-DU-DU-DU-DU Duel
        //pas encore fait ^^
    }
}