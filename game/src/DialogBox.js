export default class DialogBox {
    constructor() {
        this.canvas = document.getElementById("uiCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.isOpen = false;
    }
    show(texte) {
        console.log("show appelé", texte)
        this.messages = texte.split("|");
        this.currentIndex = 0
        this.isOpen = true
    }
    next() {
        this.currentIndex += 1;
        if (this.currentIndex >= this.messages.length) {
            this.isOpen= false;
        }
    }
   draw() {
    if (!this.isOpen) return
    const pad = 20
    const h = 140
    const y = this.canvas.height - h - pad
    const w = this.canvas.width - pad * 2

    
    this.ctx.fillStyle = "#f0f0e8"
    this.ctx.roundRect(pad, y, w, h, 14)
    this.ctx.fill()

    this.ctx.beginPath()
    this.ctx.strokeStyle = "#1a1a2e"
    this.ctx.lineWidth = 4
    this.ctx.roundRect(pad, y, w, h, 14)
    this.ctx.stroke()

    this.ctx.beginPath()
    this.ctx.strokeStyle = "#f0f0e8"
    this.ctx.lineWidth = 2
    this.ctx.roundRect(pad + 6, y + 6, w - 12, h - 12, 9)
    this.ctx.stroke()

    this.ctx.fillStyle = "#1a1a2e"
    this.ctx.font = "18px monospace"
    this.ctx.fillText(this.messages[this.currentIndex], pad + 20, y + 50)

   if (this.currentIndex < this.messages.length - 1) {
        this.ctx.beginPath()
        this.ctx.moveTo(this.canvas.width - 50, y + h - 25)
        this.ctx.lineTo(this.canvas.width - 35, y + h - 45)
        this.ctx.lineTo(this.canvas.width - 35 + 20, y + h - 25)
        this.ctx.fill()
    }
}
}