export const LearnMoveMixin = {

    drawLearnMove() {
        const ctx = this.ctx
        const w = this.canvas.width
        const h = this.canvas.height

        ctx.fillStyle = "rgba(0,0,0,0.9)"
        ctx.fillRect(0, 0, w, h)

        ctx.fillStyle = "white"
        ctx.font = "bold 14px 'Press Start 2P'"
        ctx.textAlign = "center"
        ctx.fillText(`${this.pendingMovePoke.pokemon} veut apprendre`, w / 2, h * 0.15)
        ctx.fillText(this.pendingMove.toUpperCase().replace(/-/g, ' '), w / 2, h * 0.25)
        ctx.font = "11px 'Press Start 2P'"
        ctx.fillText("Quelle attaque remplacer ?", w / 2, h * 0.35)

        const moves = [...this.pendingMovePoke.moves, "NE PAS APPRENDRE"]
        const bw = w * 0.4
        const bh = h * 0.09

        moves.forEach((move, i) => {
            const x = w / 2 - bw / 2
            const y = h * 0.45 + i * (bh + 10)
            ctx.fillStyle = move === "NE PAS APPRENDRE" ? "rgba(180,40,40,0.8)" : "rgba(60,50,80,0.9)"
            ctx.beginPath()
            ctx.roundRect(x, y, bw, bh, 10)
            ctx.fill()
            ctx.strokeStyle = "rgba(255,255,255,0.2)"
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.roundRect(x, y, bw, bh, 10)
            ctx.stroke()
            ctx.fillStyle = "white"
            ctx.font = "10px 'Press Start 2P'"
            ctx.fillText(move.toUpperCase().replace(/-/g, ' '), w / 2, y + bh / 2 + 4)
        })
        ctx.textAlign = "left"
    }
}