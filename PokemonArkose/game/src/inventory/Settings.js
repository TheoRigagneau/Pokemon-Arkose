export const SettingsMixin = {

    drawSettings() {
        const ctx = this.ctx
        const w = this.canvas.width
        const h = this.canvas.height

        ctx.fillStyle = "rgba(20, 16, 30, 0.97)"
        ctx.fillRect(0, 0, w, h)

        ctx.fillStyle = "white"
        ctx.font = "bold 14px 'Press Start 2P'"
        ctx.textAlign = "center"
        ctx.fillText("PARAMÈTRES", w / 2, 40)

        const back = this.assets.get("back")
        if (back) ctx.drawImage(back, w - 80, 10, 60, 50)

        ctx.fillStyle = "white"
        ctx.font = "bold 11px 'Press Start 2P'"
        ctx.textAlign = "left"
        ctx.fillText("VOLUME", w * 0.1, h * 0.3)

        const barX = w * 0.1
        const barY = h * 0.38
        const barW = w * 0.8
        const barH = 20

        ctx.fillStyle = "rgba(255,255,255,0.2)"
        ctx.beginPath()
        ctx.roundRect(barX, barY, barW, barH, 10)
        ctx.fill()

        ctx.fillStyle = "#80b8f0"
        ctx.beginPath()
        ctx.roundRect(barX, barY, barW * this.settingsVolume, barH, 10)
        ctx.fill()

        //curseur pour la musique
        const cursorX = barX + barW * this.settingsVolume
        ctx.fillStyle = "white"
        ctx.beginPath()
        ctx.arc(cursorX, barY + barH / 2, 14, 0, Math.PI * 2)
        ctx.fill()

        //volume de la musique
        ctx.fillStyle = "white"
        ctx.font = "11px 'Press Start 2P'"
        ctx.textAlign = "center"
        ctx.fillText(`${Math.round(this.settingsVolume * 100)}%`, w / 2, h * 0.52)
        ctx.textAlign = "left"
    }
}