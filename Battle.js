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
    }

    loadImage(path) {
        return new Promise((resolve) => {
            const img = new Image()
            img.src = path
            img.onload = () => resolve(img)
        })
    }

    draw() {

        if (!this.field || !this.platform) return
        console.log(this.field.naturalWidth, this.field.naturalHeight)
        const ctx = this.ctx
        const w = this.canvas.width
        const h = this.canvas.height
        
        ctx.clearRect(0, 0, w, h)
        
        ctx.fillStyle = "#4a8f3f"
        ctx.fillRect(0, 0, w, h)

        ctx.drawImage(this.field, 0, 0, w, h * 0.6)
        ctx.drawImage(this.platform, w * 0.65, h * 0.1, 500, 100)
        ctx.drawImage(this.platform, w * 0.2, h * 0.45, 600, 100)

        ctx.fillStyle = "#2d5a1b"
        ctx.fillRect(0, h * 0.6, w, h * 0.4)

        ctx.fillStyle = "#1a3a0f"
        ctx.fillRect(0, h * 0.6, w, 4)

        if (this.enemySprite) {
            ctx.drawImage(this.enemySprite, w * 0.74, h * 0.091 - 50, 150, 150)
        }
            }

    update() {
        // C'est l'heure du DU-DU-DU-DU-DU-DU Duel
        //pas encore fait ^^
    }
}