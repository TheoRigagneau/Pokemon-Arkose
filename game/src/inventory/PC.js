export const PCMixin = {
    //récupère les infos du pc
    async fetchPC() { 
        const res = await fetch("http://localhost:3000/api/pc")
        this.pcData = await res.json()
        for (const poke of this.pcData) {
            if (!this.pcSprites[poke.id]) {
                const img = new Image()
                img.src = `./assets/pokemon/dp/${poke.id}.png`
                img.onload = () => { this.pcSprites[poke.id] = img }
            }
        }
    },
    //page PC
    drawPC() {
        const capitalize = name => name ? name.charAt(0).toUpperCase() + name.slice(1) : ""
        const ctx = this.ctx
        const w = this.canvas.width
        const h = this.canvas.height

        ctx.fillStyle = "#0a0a1a"
        ctx.fillRect(0, 0, w, h)

        ctx.fillStyle = "white"
        ctx.font = "bold 14px 'Press Start 2P'"
        ctx.textAlign = "center"
        ctx.fillText("PC", w / 2, 40)

        const back = this.assets.get("back")
        if (back) ctx.drawImage(back, w - 80, 10, 60, 50)

        ctx.font = "bold 10px 'Press Start 2P'"
        ctx.fillStyle = "#80b8f0"
        ctx.textAlign = "left"
        ctx.fillText("ÉQUIPE", 20, 75)
        ctx.fillText("PC", w / 2 + 20, 75)

        ctx.strokeStyle = "rgba(255,255,255,0.2)"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(w / 2, 60)
        ctx.lineTo(w / 2, h - 20)
        ctx.stroke()

        const slotW = w / 2 - 30
        const slotH = 70
        const startY = 90
        //slots de l'équipe
        for (let i = 0; i < 6; i++) {
            const poke = this.teamData[i]
            const x = 15
            const y = startY + i * (slotH + 8)

            ctx.fillStyle = poke ? "rgba(60,90,140,0.8)" : "rgba(30,30,50,0.5)"
            ctx.beginPath()
            ctx.roundRect(x, y, slotW, slotH, 8)
            ctx.fill()
            ctx.strokeStyle = poke ? "#80b8f0" : "rgba(255,255,255,0.1)"
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.roundRect(x, y, slotW, slotH, 8)
            ctx.stroke()
            //sprite
            if (poke) {
                const sprite = this.teamSprites[poke.id]
                if (sprite) ctx.drawImage(sprite, x + 4, y + 4, slotH - 8, slotH - 8)
                ctx.fillStyle = "white"
                ctx.font = "bold 9px 'Press Start 2P'"
                ctx.textAlign = "left"
                ctx.fillText(capitalize(poke.pokemon), x + slotH + 4, y + slotH * 0.4)
                ctx.font = "7px 'Press Start 2P'"
                ctx.fillStyle = "rgba(255,255,255,0.7)"
                ctx.fillText(`Nv.${poke.niveau}`, x + slotH + 4, y + slotH * 0.65)
            }
            //mets un coutour jaune pour savoir le poké sélecttionné
            if (this.pcSelected && this.pcSelected.source === "team" && this.pcSelected.index === i) {
                ctx.strokeStyle = "#ffff00"
                ctx.lineWidth = 3
                ctx.beginPath()
                ctx.roundRect(x, y, slotW, slotH, 8)
                ctx.stroke()
            }
        }
        //slots pleins du pc
        for (let i = 0; i < this.pcData.length; i++) {
            const poke = this.pcData[i]
            const x = w / 2 + 15
            const y = startY + i * (slotH + 8)

            ctx.fillStyle = "rgba(60,90,140,0.8)"
            ctx.beginPath()
            ctx.roundRect(x, y, slotW, slotH, 8)
            ctx.fill()
            ctx.strokeStyle = "#80b8f0"
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.roundRect(x, y, slotW, slotH, 8)
            ctx.stroke()

            const sprite = this.pcSprites[poke.id]
            if (sprite) ctx.drawImage(sprite, x + 4, y + 4, slotH - 8, slotH - 8)
            ctx.fillStyle = "white"
            ctx.font = "bold 9px 'Press Start 2P'"
            ctx.textAlign = "left"
            ctx.fillText(capitalize(poke.pokemon), x + slotH + 4, y + slotH * 0.4)
            ctx.font = "7px 'Press Start 2P'"
            ctx.fillStyle = "rgba(255,255,255,0.7)"
            ctx.fillText(`Nv.${poke.niveau}`, x + slotH + 4, y + slotH * 0.65)

            if (this.pcSelected && this.pcSelected.source === "pc" && this.pcSelected.index === i) {
                ctx.strokeStyle = "#ffff00"
                ctx.lineWidth = 3
                ctx.beginPath()
                ctx.roundRect(x, y, slotW, slotH, 8)
                ctx.stroke()
            }
        }
        //slots vide du pc
        for (let i = this.pcData.length; i < 6; i++) {
            const x = w / 2 + 15
            const y = startY + i * (slotH + 8)
            ctx.fillStyle = "rgba(30,30,50,0.5)"
            ctx.beginPath()
            ctx.roundRect(x, y, slotW, slotH, 8)
            ctx.fill()
            ctx.strokeStyle = "rgba(255,255,255,0.1)"
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.roundRect(x, y, slotW, slotH, 8)
            ctx.stroke()
        }

        ctx.textAlign = "left"
    },

    async swapPCPokemon(source, index) {
        if (!this.pcSelected) {
            this.pcSelected = { source, index }
            return
        }

        const selected_pkm = this.pcSelected
        this.pcSelected = null

        if (selected_pkm.source === source && selected_pkm.index === index) return
        //copie le poké avec un nouvel identifiant pour mongodb
        const clean = (poke) => {
            const { _id, __v, ...rest } = poke
            return rest
        }

        if (selected_pkm.source === "team" && source === "pc") {
            const teamPoke = this.teamData[selected_pkm.index]
            const pcPoke = this.pcData[index]
            //vérifie s'il reste un poké avec de la vie dans la team
            const aliveCount = this.teamData.filter((p, i) => i !== selected_pkm.index && (p?.currentHP ?? 0) > 0).length
            if (!pcPoke && aliveCount === 0) return
            //déplace le poké de la team dans le pc
            await fetch(`http://localhost:3000/api/pc`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(clean(teamPoke)) })
            await fetch(`http://localhost:3000/api/team/${teamPoke._id}`, { method: "DELETE" })

            if (pcPoke) {
                //déplace le poké du pc dans la team
                await fetch(`http://localhost:3000/api/team`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(clean(pcPoke)) })
                await fetch(`http://localhost:3000/api/pc/${pcPoke._id}`, { method: "DELETE" })
            }
        } 

        else if (selected_pkm.source === "pc" && source === "team") {
            const pcPoke = this.pcData[selected_pkm.index]
            const teamPoke = this.teamData[index]
            //échange les pokémons séléctionner
            //celui du pc dans la team
            await fetch(`http://localhost:3000/api/team`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(clean(pcPoke)) })
            await fetch(`http://localhost:3000/api/pc/${pcPoke._id}`, { method: "DELETE" })

            //et celui de la team au pc
            if (teamPoke) {
                await fetch(`http://localhost:3000/api/pc`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(clean(teamPoke)) })
                await fetch(`http://localhost:3000/api/team/${teamPoke._id}`, { method: "DELETE" })
            }
        }

        await this.fetchTeam()
        await this.fetchPC()
    }
}