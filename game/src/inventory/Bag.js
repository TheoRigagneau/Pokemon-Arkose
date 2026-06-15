export const BagMixin = {

    async fetchInventory() {
        const [invRes, itemsRes] = await Promise.all([
            fetch("http://localhost:3000/api/inventory"),
            fetch("http://localhost:3000/api/items")
        ])
        this.inventoryData = await invRes.json()
        this.itemsData = await itemsRes.json()
    },
    //sac
    drawSac() {
        const ctx = this.ctx
        const w = this.canvas.width
        const h = this.canvas.height

        ctx.fillStyle = "#f0ede0"
        ctx.fillRect(0, 0, w, h)

        ctx.fillStyle = "#2a2a2a"
        ctx.font = "bold 14px 'Press Start 2P'"
        ctx.textAlign = "center"
        ctx.fillText("SAC", w / 2, 40)

        const back = this.assets.get("back")
        if (back) ctx.drawImage(back, w - 80, 10, 60, 50)
        //partie heal
        const healItems = this.inventoryData.filter(inv => {
            const item = this.itemsData.find(i => i.name === inv.itemName)
            return item?.type === "heal" || item?.type === "revive" || item?.type === "candy"
        })
        //partie ball
        const ballItems = this.inventoryData.filter(inv => {
            const item = this.itemsData.find(i => i.name === inv.itemName)
            return item?.type === "pokeball"
        })

        ctx.fillStyle = "#e05555"
        ctx.font = "bold 11px 'Press Start 2P'"
        ctx.textAlign = "left"
        ctx.fillText("SOINS", w * 0.05, h * 0.14)

        ctx.fillStyle = "#4080d0"
        ctx.fillText("POKÉBALLS", w * 0.55, h * 0.14)
        //case pour les objets de soins
        healItems.forEach((inv, i) => {
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
            ctx.font = "bold 10px 'Press Start 2P'"
            ctx.textAlign = "left"
            ctx.fillText(inv.itemName, x + 12, y + h * 0.038)
            ctx.fillStyle = "#e05555"
            ctx.font = "bold 10px 'Press Start 2P'"
            ctx.textAlign = "right"
            ctx.fillText(`x${inv.quantity}`, x + w * 0.42 - 12, y + h * 0.055)
            ctx.textAlign = "left"
        })
        //case pour les balls
        ballItems.forEach((inv, i) => {
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
            ctx.font = "bold 10px 'Press Start 2P'"
            ctx.textAlign = "left"
            ctx.fillText(inv.itemName, x + 12, y + h * 0.038)
            ctx.fillStyle = "#4080d0"
            ctx.font = "bold 10px 'Press Start 2P'"
            ctx.textAlign = "right"
            ctx.fillText(`x${inv.quantity}`, x + w * 0.42 - 12, y + h * 0.055)
            ctx.textAlign = "left"
        })
    },
    async useCandy(poke) {
        if (!this.selectedItem) return
        const capitalize = name => name.charAt(0).toUpperCase() + name.slice(1)
        //change ses stats
        const newNiveau = poke.niveau + 1
        const newMaxHP = (poke.maxHP ?? 0) + 2
        const newCurrentHP = poke.currentHP + 2
        //vérifie s'il n'apprend pas de nouvelles attaques à ce niveau
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${poke.id}`)
        const data = await res.json()
        const newMoves = data.moves.filter(m => m.version_group_details.some(v =>
            v.move_learn_method.name === "level-up" && v.level_learned_at === newNiveau
        )).map(m => m.move.name)

        if (newMoves.length > 0) {
            this.pendingMove = newMoves[0]
            this.pendingMovePoke = poke
            this.canvas.style.pointerEvents = "all"
        }
        //vérifie s'il peut évoluer à ce niveau
        const evoName = await this.checkEvolution(poke.id, newNiveau)
        if (evoName) {
            const evoRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${evoName}`)
            const evoData = await evoRes.json()
            //change les infos du poké dans la db
            await fetch(`http://localhost:3000/api/team/${poke._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pokemon: evoName, id: evoData.id, niveau: newNiveau, maxHP: newMaxHP, currentHP: newCurrentHP })
            })
            //change les infos du poké maintenant évoluer et mets un message pour dire qu'il a évolué
            const oldName = poke.pokemon
            poke.pokemon = capitalize(evoName)
            poke.id = evoData.id
            this.pendingEvolutionMessage = `${oldName} a évolué en ${capitalize(evoName)} !`
            setTimeout(() => { this.pendingEvolutionMessage = null }, 3000)
        } 

        else {
            //change les stats dans la db
            await fetch(`http://localhost:3000/api/team/${poke._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ niveau: newNiveau, maxHP: newMaxHP, currentHP: newCurrentHP })
            })
        }
        //supprime un bonbon du sac
        await fetch(`http://localhost:3000/api/inventory/${encodeURIComponent(this.selectedItem.itemName)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: -1 })
        })

        poke.niveau = newNiveau
        poke.maxHP = newMaxHP
        poke.currentHP = newCurrentHP
        this.selectedItem.quantity--
        this.selectedItem = null
        this.showTeam = false
        this.activeTab = "sac"
        this.showSac = true
        await this.fetchInventory()
        await this.fetchTeam()
    },

    async checkEvolution(pokeId, niveau) {
        //reagrde si le poke peut évoluer à ce niveau
        const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokeId}`)
        const speciesData = await speciesRes.json()

        const chainRes = await fetch(speciesData.evolution_chain.url)
        const chainData = await chainRes.json()

        const findEvolution = (chain) => {
            const speciesId = parseInt(chain.species.url.split('/').filter(Boolean).pop())
            if (speciesId === pokeId) {
                for (const evo of chain.evolves_to) {
                    const detail = evo.evolution_details[0]
                    if (detail?.trigger?.name === "level-up" && detail?.min_level <= niveau) {
                        return evo.species.name
                    }
                }
            }
            for (const evo of chain.evolves_to) {
                const result = findEvolution(evo)
                if (result) return result
            }
            return null
        }

        return findEvolution(chainData.chain)
    },

    async useHeal(poke, item) {
        if (!this.selectedItem) return
        const isDead = (poke.currentHP ?? 0) <= 0
        const isFull = poke.currentHP >= poke.maxHP
        if (isDead || isFull) return
        //heal le poké en fonction de l'objet utilisé
        const newHP = Math.min(poke.currentHP + item.healAmount, poke.maxHP)
        //change les infos dans la db
        await fetch(`http://localhost:3000/api/team/${poke._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentHP: newHP })
        })
        //retire un objet utilisé de la db
        await fetch(`http://localhost:3000/api/inventory/${encodeURIComponent(this.selectedItem.itemName)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: -1 })
        })

        poke.currentHP = newHP
        this.selectedItem.quantity--
        this.selectedItem = null
        this.showTeam = false
        this.activeTab = "sac"
        this.showSac = true
        await this.fetchInventory()
        await this.fetchTeam()
    },

    async useRevive(poke) {
        if (!this.selectedItem) return
        const isDead = (poke.currentHP ?? 0) <= 0
        if (!isDead) return

        //revive le poké
        const newHP = Math.floor(poke.maxHP / 2)

        //change les infos dans la db
        await fetch(`http://localhost:3000/api/team/${poke._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentHP: newHP })
        })

        //supprime un rappel
        await fetch(`http://localhost:3000/api/inventory/${encodeURIComponent(this.selectedItem.itemName)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: -1 })
        })

        poke.currentHP = newHP
        this.selectedItem.quantity--
        this.selectedItem = null
        this.showTeam = false
        this.activeTab = "sac"
        this.showSac = true
        await this.fetchInventory()
        await this.fetchTeam()
    },

    
}