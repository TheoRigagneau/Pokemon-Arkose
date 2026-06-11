export const BadgesMixin = {

    drawBadges() {
        const ctx = this.ctx
        const w = this.canvas.width
        const h = this.canvas.height

        ctx.fillStyle = "rgba(20, 16, 30, 0.97)"
        ctx.fillRect(0, 0, w, h)

        const back = this.assets.get("back")
        if (back) ctx.drawImage(back, w - 80, 10, 60, 50)

        const badgecase = this.assets.get("badgecase")
        if (badgecase) {
            const scale = Math.min(w / badgecase.width, h / badgecase.height) * 0.8
            const bw = badgecase.width * scale
            const bh = badgecase.height * scale
            ctx.drawImage(badgecase, (w - bw) / 2, (h - bh) / 2, bw, bh)
        }
    }
}