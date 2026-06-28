export const BadgesMixin = {
    async fetchBadges() {
        const res = await fetch("http://localhost:3000/api/badges")
        this.badgesData = await res.json()
        console.log("badges chargés:", this.badgesData)
    },

    drawBadges() {
        //page badge
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
            const bx = (w - bw) / 2
            const by = (h - bh) / 2
            ctx.drawImage(badgecase, bx, by, bw, bh)

            const positions = [
                { x: bx + bw * 0.2, y: by + bh * 0.35 },
                { x: bx + bw * 0.4, y: by + bh * 0.35 },
                { x: bx + bw * 0.6, y: by + bh * 0.35 },
                { x: bx + bw * 0.8, y: by + bh * 0.35 },
                { x: bx + bw * 0.2, y: by + bh * 0.65 },
                { x: bx + bw * 0.4, y: by + bh * 0.65 },
                { x: bx + bw * 0.6, y: by + bh * 0.65 },
                { x: bx + bw * 0.8, y: by + bh * 0.65 },
            ]

            const badge1 = this.assets.get("badge1")
            //ajoute le premier badge si récupéré
            if (badge1 && this.badgesData) {
                console.log("badge1")
                for (const badge of this.badgesData) {
                    const pos = positions[badge.badgeId - 1]
                    if (pos) ctx.drawImage(badge1, pos.x - 47, pos.y + 125, 74, 74)
                }
            }
        }
    }
}