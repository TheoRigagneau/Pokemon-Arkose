export const BattleUIMixin = {

    draw() {
        if (!this.field || !this.platform || !this.enemy_hp_bar || !this.pokemon_bar || !this.ready) return
        
        const ctx = this.ctx
        const w   = this.canvas.width
        const h   = this.canvas.height
        
        ctx.clearRect(0, 0, w, h)

        ctx.fillStyle = "#4a8f3f"
        ctx.fillRect(0, 0, w, h)
        ctx.drawImage(this.field, 0, 0, w, h * 0.6)

        ctx.drawImage(this.platform,     w * 0.48, h * 0.2,  800, 100)
        ctx.drawImage(this.enemy_hp_bar, w * 0.02, h * 0.04, 600, 120)
        ctx.drawImage(this.platform,     w * 0.02, h * 0.42, 900, 100)
        ctx.drawImage(this.pokemon_bar,  w * 0.55, h * 0.38, 600, 120)

        ctx.fillStyle = "#2d5a1b"
        ctx.fillRect(0, h * 0.55, w, h * 0.45)
        ctx.fillStyle = "#1a3a0f"
        ctx.fillRect(0, h * 0.55, w, 4)
        ctx.strokeStyle = "white"
        ctx.lineWidth = 3
        ctx.strokeRect(0, h * 0.55, w, h * 0.45)

        if (this.currentMenu === "main") {
            this.drawMessage(ctx, w, h)
            this.drawButtons(ctx, w, h)
        } else if (this.currentMenu === "fight") {
            this.drawAttacks(ctx, w, h)
            this.drawMessage(ctx, w, h)
        } else if (this.currentMenu === "bag") {
            this.drawObjects(ctx, w, h)
            return
        } else if (this.currentMenu === "pokemon") {
            this.drawTeam(ctx, w, h)
            return
        }

        if (this.enemySprite && this.enemyDisplayHP > 0) {
            ctx.drawImage(this.enemySprite, w * 0.62, h * 0.08, 220, 220)
        }
        if (this.playerSprite) {
            ctx.drawImage(this.playerSprite, w * 0.18, h * 0.28, 220, 220)
        }

        ctx.strokeStyle = "black"
        ctx.font = "bold 18px 'Press Start 2P'"
        ctx.lineWidth = 3
        ctx.strokeText(this.encounter.pokemon, w * 0.04, h * 0.09)
        ctx.strokeText(`${this.encounter.niveau}`, w * 0.188, h * 0.085)
        ctx.fillStyle = "white"
        ctx.fillText(this.encounter.pokemon, w * 0.04, h * 0.085)
        ctx.fillText(`${this.encounter.niveau}`, w * 0.188, h * 0.085)

        if (this.playerSprite) {
            ctx.strokeStyle = "black"
            ctx.lineWidth = 2
            ctx.font = "bold 22px 'Press Start 2P'"
            ctx.strokeText(this.playerPokemon.pokemon, w * 0.622, h * 0.4352)
            ctx.fillStyle = "white"
            ctx.fillText(this.playerPokemon.pokemon, w * 0.62, h * 0.435)
            ctx.strokeText(`${this.playerPokemon.niveau}`, w * 0.812, h * 0.4352)
            ctx.fillText(`${this.playerPokemon.niveau}`, w * 0.81, h * 0.435)
        }

        if (this.playerMaxHP) {
            const barX = w * 0.766
            const barY = h * 0.458
            const barMaxWidth = w * 0.1179
            const barHeight = 7
            const hpPercent = this.playerDisplayHP >= this.playerMaxHP ? 1 : this.playerDisplayHP / this.playerMaxHP
            const barColor = hpPercent > 0.5 ? "#00c800" : hpPercent > 0.2 ? "#f8d030" : "#f82800"
            ctx.fillStyle = barColor
            ctx.fillRect(barX, barY, barMaxWidth * hpPercent, barHeight)
        }

        if (this.playerPokemon?.xp !== undefined) {
            const currentLevel = this.playerPokemon.niveau
            const xpNeeded = Math.pow(currentLevel + 1, 2) * 5
            const xpProgress = this.playerXpDisplay / xpNeeded
            const barX = w * 0.626
            const barY = h * 0.5301
            const barMaxWidth = w * 0.29
            const barHeight = 6
            ctx.fillStyle = "#4080f0"
            ctx.fillRect(barX, barY, barMaxWidth * Math.max(0, Math.min(1, xpProgress)), barHeight)
        }

        if (this.enemyMaxHP) {
            const barX = w * 0.1177
            const barY = h * 0.11
            const barMaxWidth = w * 0.095
            const barHeight = 7
            const hpPercent = this.enemyDisplayHP / this.enemyMaxHP
            const barColor = hpPercent > 0.5 ? "#00c800" : hpPercent > 0.2 ? "#f8d030" : "#f82800"
            ctx.fillStyle = barColor
            ctx.fillRect(barX, barY, barMaxWidth * hpPercent, barHeight)
        }

        if (this.animating) {
            if (this.waitingScreen) {
                ctx.drawImage(this.waitingScreen, 0, h * 0.55, w, h * 0.45)
            } else {
                ctx.fillStyle = "#1a1a2e"
                ctx.fillRect(0, h * 0.55, w, h * 0.45)
            }
            ctx.fillStyle = "#1a3a0f"
            ctx.fillRect(0, h * 0.55, w, 4)
            ctx.strokeStyle = "white"
            ctx.lineWidth = 3
            ctx.strokeRect(0, h * 0.55, w, h * 0.45)
            this.drawMessage(ctx, w, h)
        }
    if (this.pendingMove) {
        this.drawLearnMove(ctx, w, h)
    }
    },

    drawMessage(ctx, w, h) {
        const boxH = h * 0.12
        const boxX = w * 0.02
        const boxY = h * 0.56
        const boxW = w * 0.9

        ctx.fillStyle = "white"
        ctx.beginPath()
        ctx.roundRect(boxX, boxY, boxW, boxH, 6)
        ctx.fill()

        ctx.strokeStyle = "#4860f0"
        ctx.lineWidth = 5
        ctx.beginPath()
        ctx.roundRect(boxX, boxY, boxW, boxH, 6)
        ctx.stroke()

        ctx.strokeStyle = "#98b0ff"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.roundRect(boxX + 6, boxY + 6, boxW - 12, boxH - 12, 3)
        ctx.stroke()

        ctx.fillStyle = "#1a1a2e"
        ctx.font = "bold 15px monospace"
        ctx.fillText(
            this.message ?? (this.animating ? "" : `Que doit faire ${this.playerPokemon?.pokemon ?? ""} ?`),
            boxX + 16, boxY + boxH / 2 + 6
        )
    },

    drawButtons(ctx, w, h) {
        const isTrainer = this.encounter.isTrainer
        const buttons = [
            { label: "COMBAT",  color: "#e05555", shadow: "#a03030", x: w * 0.3, y: h * 0.76 },
            { label: "SAC",     color: "#d4a020", shadow: "#9a6e10", x: w * 0.7, y: h * 0.76 },
            { label: "POKEMON", color: "#50a850", shadow: "#307030", x: w * 0.3, y: h * 0.9  },
            { label: "FUITE",   color: isTrainer ? "#888888" : "#4080d0", shadow: isTrainer ? "#555555" : "#205090", x: w * 0.7, y: h * 0.9 },
        ]
        const bw = w * 0.32
        const bh = h * 0.1

        for (const btn of buttons) {
            const bx = btn.x - bw / 2
            const by = btn.y - bh / 2

            ctx.fillStyle = btn.shadow
            ctx.beginPath()
            ctx.roundRect(bx + 4, by + 6, bw, bh, 16)
            ctx.fill()

            ctx.fillStyle = btn.color
            ctx.beginPath()
            ctx.roundRect(bx, by, bw, bh, 16)
            ctx.fill()

            ctx.fillStyle = "rgba(255,255,255,0.25)"
            ctx.beginPath()
            ctx.roundRect(bx + 8, by + 4, bw - 16, bh * 0.4, 10)
            ctx.fill()

            ctx.fillStyle = "white"
            ctx.font = "bold 13px 'Press Start 2P'"
            ctx.textAlign = "center"
            ctx.shadowColor = "rgba(0,0,0,0.4)"
            ctx.shadowBlur = 4
            ctx.fillText(btn.label, btn.x, btn.y + 6)
            ctx.shadowBlur = 0
            ctx.textAlign = "left"
        }
    },

    drawObjects(ctx, w, h) {
        ctx.fillStyle = "#f0ede0"
        ctx.fillRect(0, 0, w, h)

        ctx.fillStyle = "#2a2a2a"
        ctx.font = "bold 18px 'Press Start 2P'"
        ctx.textAlign = "center"
        ctx.fillText("SAC", w / 2, h * 0.06)
        ctx.textAlign = "left"

        const healItems = this.inventory?.filter(inv => {
            const item = this.items?.find(i => i.name === inv.itemName)
            return item?.type === "heal" || item?.type === "revive" || item?.type === "candy"}) ?? []

        const ballItems = this.inventory?.filter(inv => {
            const item = this.items?.find(i => i.name === inv.itemName)
            return item?.type === "pokeball"}) ?? []

        ctx.fillStyle = "#e05555"
        ctx.font = "bold 12px 'Press Start 2P'"
        ctx.fillText("SOINS", w * 0.05, h * 0.14)

        ctx.fillStyle = "#4080d0"
        ctx.fillText("POKÉBALLS", w * 0.55, h * 0.14)

        healItems.forEach((inv, i) => {
            const item = this.items.find(it => it.name === inv.itemName)
            const x = w * 0.04
            const y = h * 0.2 + i * h * 0.12

            ctx.fillStyle = "#ffffff"
            ctx.beginPath()
            ctx.roundRect(x, y, w * 0.42, h * 0.1, 10)
            ctx.fill()
            ctx.strokeStyle = "#e05555"
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.roundRect(x, y, w * 0.42, h * 0.1, 10)
            ctx.stroke()

            ctx.fillStyle = "#2a2a2a"
            ctx.font = "bold 11px 'Press Start 2P'"
            ctx.fillText(inv.itemName, x + 12, y + h * 0.038)
            ctx.font = "9px 'Press Start 2P'"
            ctx.fillStyle = "#e05555"
            ctx.font = "bold 11px 'Press Start 2P'"
            ctx.textAlign = "right"
            ctx.fillText(`x${inv.quantity}`, x + w * 0.42 - 12, y + h * 0.055)
            ctx.textAlign = "left"
        })

        ballItems.forEach((inv, i) => {
            const item = this.items.find(it => it.name === inv.itemName)
            const x = w * 0.54
            const y = h * 0.2 + i * h * 0.12

            ctx.fillStyle = "#ffffff"
            ctx.beginPath()
            ctx.roundRect(x, y, w * 0.42, h * 0.1, 10)
            ctx.fill()
            ctx.strokeStyle = "#4080d0"
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.roundRect(x, y, w * 0.42, h * 0.1, 10)
            ctx.stroke()

            ctx.fillStyle = "#2a2a2a"
            ctx.font = "bold 11px 'Press Start 2P'"
            ctx.fillText(inv.itemName, x + 12, y + h * 0.038)
            ctx.font = "9px 'Press Start 2P'"
            ctx.fillStyle = "#666"
            ctx.font = "bold 11px 'Press Start 2P'"
            ctx.textAlign = "right"
            ctx.fillText(`x${inv.quantity}`, x + w * 0.42 - 12, y + h * 0.055)
            ctx.textAlign = "left"
        })

        if (this.back) ctx.drawImage(this.back, w * 0.91, h * 0.02, w * 0.08, h * 0.06)
    },

    drawAttacks(ctx, w, h) {
        ctx.fillStyle = "#6b5f78"
        ctx.fillRect(0, h * 0.55, w, h * 0.45)

        if (!this.playerPokemon?.moves) return

        const TYPE_COLORS = {
            normal:   { color: "#A8A878", shadow: "#6D6D4E" },
            fire:     { color: "#F08030", shadow: "#9C531F" },
            water:    { color: "#6890F0", shadow: "#445E9C" },
            grass:    { color: "#78C850", shadow: "#4E8234" },
            electric: { color: "#F8D030", shadow: "#A1871F" },
            ice:      { color: "#98D8D8", shadow: "#638D8D" },
            fighting: { color: "#C03028", shadow: "#7D1F1A" },
            poison:   { color: "#A040A0", shadow: "#682A68" },
            ground:   { color: "#E0C068", shadow: "#927D44" },
            flying:   { color: "#A890F0", shadow: "#6D5E9C" },
            psychic:  { color: "#F85888", shadow: "#A13959" },
            bug:      { color: "#A8B820", shadow: "#6D7815" },
            rock:     { color: "#B8A038", shadow: "#786824" },
            ghost:    { color: "#705898", shadow: "#493963" },
            dragon:   { color: "#7038F8", shadow: "#4924A1" },
            dark:     { color: "#705848", shadow: "#49392F" },
            steel:    { color: "#B8B8D0", shadow: "#787887" },
            fairy:    { color: "#EE99AC", shadow: "#9B6470" },
        }

        const positions = [
            { x: w * 0.25, y: h * 0.76 },
            { x: w * 0.75, y: h * 0.76 },
            { x: w * 0.25, y: h * 0.91 },
            { x: w * 0.75, y: h * 0.91 },
        ]
        const bw = w * 0.38
        const bh = h * 0.11

        for (let i = 0; i < this.playerPokemon.moves.length; i++) {
            const bx = positions[i].x - bw / 2
            const by = positions[i].y - bh / 2

            const type   = this.moveTypes?.[this.playerPokemon.moves[i]] || "normal"
            const colors = TYPE_COLORS[type] || TYPE_COLORS.normal

            ctx.fillStyle = colors.shadow
            ctx.beginPath()
            ctx.roundRect(bx + 4, by + 6, bw, bh, 12)
            ctx.fill()

            ctx.fillStyle = colors.color
            ctx.beginPath()
            ctx.roundRect(bx, by, bw, bh, 12)
            ctx.fill()

            ctx.fillStyle = "rgba(255,255,255,0.2)"
            ctx.beginPath()
            ctx.roundRect(bx + 8, by + 4, bw - 16, bh * 0.35, 8)
            ctx.fill()

            ctx.fillStyle = "white"
            ctx.font = "bold 12px 'Press Start 2P'"
            ctx.textAlign = "center"
            ctx.shadowColor = "rgba(0,0,0,0.5)"
            ctx.shadowBlur = 4
            ctx.fillText(
                this.playerPokemon.moves[i].toUpperCase().replace(/-/g, ' '),
                positions[i].x,
                positions[i].y + 5
            )
            ctx.shadowBlur = 0
        }
        ctx.textAlign = "left"

        const backW = w * 0.08
        const backH = h * 0.11
        const backX = w * 0.46
        const backY = h * 0.845

        if (this.back) {
            ctx.drawImage(this.back, backX, backY, backW, backH)
        }
    },

    drawLearnMove(ctx, w, h) {
        ctx.fillStyle = "rgba(0,0,0,0.85)"
        ctx.fillRect(0, 0, w, h)

        ctx.fillStyle = "white"
        ctx.font = "bold 14px 'Press Start 2P'"
        ctx.textAlign = "center"
        ctx.fillText(`${this.playerPokemon.pokemon} veut apprendre`, w / 2, h * 0.15)
        ctx.fillText(this.pendingMove.toUpperCase().replace(/-/g, ' '), w / 2, h * 0.25)
        ctx.font = "11px 'Press Start 2P'"
        ctx.fillText("Quelle attaque remplacer ?", w / 2, h * 0.35)

        const moves = [...this.playerPokemon.moves, "NE PAS APPRENDRE"]
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