export default class DialogBox {
    constructor() {
        this.canvas = document.getElementById("uiCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.isOpen = false;
        this.choices = null;
        this.selectedChoice = 0;
    }

    show(texte, choices = null) {
        this.messages = texte.split("|");
        this.currentIndex = 0;
        this.isOpen = true;
        this.choices = null;
        this.selectedChoice = 0;
        
        if (choices) {
            this.pendingChoices = choices;
        } else {
            this.pendingChoices = null;
        }
    }

    next() {
        this.currentIndex += 1;
        if (this.currentIndex >= this.messages.length) {
            if (this.pendingChoices) {
                this.choices = this.pendingChoices;
                this.pendingChoices = null;
            } else {
                this.isOpen = false;
            }
        }
    }

    confirmChoice() {
        if (!this.choices) return
        const choice = this.choices[this.selectedChoice]
        this.choices = null
        this.isOpen = false
        choice.action()
    }

    navigateChoice(direction) {
        if (!this.choices) return
        this.selectedChoice = (this.selectedChoice + direction + this.choices.length) % this.choices.length
    }

    draw() {
        if (!this.isOpen) return
        const pad = 20
        const h = 140
        const y = this.canvas.height - h - pad
        const w = this.canvas.width - pad * 2

        this.ctx.fillStyle = "#f0f0e8"
        this.ctx.beginPath()
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

        if (this.choices) {
            this.ctx.fillText("Que veux-tu faire ?", pad + 20, y + 50)
            this.choices.forEach((choice, i) => {
                const isSelected = i === this.selectedChoice
                this.ctx.fillStyle = isSelected ? "#e05555" : "#1a1a2e"
                this.ctx.font = isSelected ? "bold 18px monospace" : "18px monospace"
                this.ctx.fillText(`${isSelected ? "▶ " : "  "}${choice.label}`, pad + 40, y + 80 + i * 30)
            })
        } else {
            this.ctx.fillStyle = "#1a1a2e"
            this.ctx.font = "18px monospace"
            this.ctx.fillText(this.messages[this.currentIndex], pad + 20, y + 50)

            if (this.currentIndex < this.messages.length - 1) {
                this.ctx.beginPath()
                this.ctx.fillStyle = "#1a1a2e"
                this.ctx.moveTo(this.canvas.width - 50, y + h - 25)
                this.ctx.lineTo(this.canvas.width - 35, y + h - 45)
                this.ctx.lineTo(this.canvas.width - 35 + 20, y + h - 25)
                this.ctx.fill()
            }
        }
    }
}