export const BattleDataMixin = {

    loadImage(path) {
        return new Promise((resolve) => {
            const img = new Image()
            img.src = path
            img.onload = () => resolve(img)
            img.onerror = () => {
                console.warn(`Failed to load image: ${path}`)
                resolve(null)
            }
        })
    },

    async useItem(targetPoke) {
        const item = this.items?.find(i => i.name === this.selectedItem.itemName)
        if (!item) return

        let newHP = targetPoke.currentHP ?? 0

        if (item.type === "heal") {
            const pokeMaxHP = targetPoke._id === this.playerPokemon._id ? this.playerMaxHP : (targetPoke.maxHP ?? this.playerMaxHP)
            newHP = Math.min(newHP + item.healAmount, pokeMaxHP)
        } else if (item.type === "revive") {
            newHP = Math.floor(this.playerMaxHP / 2)
        }

        await fetch(`http://localhost:3000/api/team/${targetPoke._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentHP: newHP })
        })

        await fetch(`http://localhost:3000/api/inventory/${encodeURIComponent(this.selectedItem.itemName)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: -1 })
        })

        targetPoke.currentHP = newHP
        this.selectedItem.quantity--
        if (targetPoke._id === this.playerPokemon._id) {
            this.playerCurrentHP = newHP
            this.playerDisplayHP = newHP
        }

        this.selectedItem = null
        this.currentMenu = "main"

        const enemyMove = this.getBestEnemyMove()
        this.animating = true
        await this.attack(enemyMove, true)
        this.animating = false
        this.message = null
    },

    async saveHP() {
        if (!this.playerPokemon) return
        await fetch(`http://localhost:3000/api/team/${this.playerPokemon._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentHP: this.playerCurrentHP })
        })
    },

    async giveXP(amount) {
        const currentXP = this.playerPokemon.xp || 0
        let newXP = currentXP + amount
        let newNiveau = this.playerPokemon.niveau
        const xpNeeded = Math.pow(newNiveau + 1, 2) * 5
        const levelUp = newXP >= xpNeeded

        this.playerXpDisplay = currentXP

        if (levelUp) {
            this.xpTarget = xpNeeded
            await new Promise(resolve => {
                const wait = setInterval(() => {
                    if (this.playerXpDisplay >= xpNeeded) {
                        clearInterval(wait)
                        this.playerXpDisplay = 0
                        resolve()
                    }
                }, 16)
            })
            newXP = 0
            newNiveau++

            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${this.playerPokemon.id}`)
            const data = await res.json()
            const baseHP = data.stats.find(s => s.stat.name === "hp").base_stat
            const newMaxHP = Math.floor((2 * baseHP * newNiveau) / 100) + newNiveau + 10
            this.playerMaxHP = newMaxHP
            this.playerPokemon.maxHP = newMaxHP

            const newMoves = data.moves.filter(m => m.version_group_details.some(v => //va chercher les attaques qui
            v.move_learn_method.name === "level-up" && v.level_learned_at === newNiveau)).map(m => m.move.name) // s'apprennent par monté de niveau 
            console.log("niveau:", newNiveau, "newMoves:", newMoves)
            if (newMoves.length > 0) {
                this.pendingMove = newMoves[0]
            }
        }
        const evoName = await this.checkEvolution(newNiveau)
        if (evoName) {
            const capitalize = name => name.charAt(0).toUpperCase() + name.slice(1)
            this.message = `${this.playerPokemon.pokemon} évolue en ${capitalize(evoName).toUpperCase()} !`
            this.messageTimer = 180

            const evoRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${evoName}`)
            const evoData = await evoRes.json()
            const evoMaxHP = Math.floor((2 * evoData.stats.find(s => s.stat.name === "hp").base_stat * newNiveau) / 100) + newNiveau + 10

            await fetch(`http://localhost:3000/api/team/${this.playerPokemon._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pokemon: evoName,
                    id: evoData.id,
                    maxHP: evoMaxHP,
                    currentHP: evoMaxHP
                })
            })

            this.playerPokemon.pokemon = capitalize(evoName)
            this.playerPokemon.id = evoData.id
            this.playerMaxHP = evoMaxHP
            this.playerCurrentHP = evoMaxHP
            this.playerSprite = await this.loadImage(`./assets/pokemon/dp/back/${evoData.id}.png`)
            this.enemySprite = await this.loadImage(`./assets/pokemon/dp/shiny/${evoData.id}.png`)
        }
        

        this.xpTarget = newXP
        this.playerPokemon.xp = newXP
        this.playerPokemon.niveau = newNiveau

        await fetch(`http://localhost:3000/api/team/${this.playerPokemon._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                xp: newXP, 
                niveau: newNiveau,
                maxHP: this.playerPokemon.maxHP ?? this.playerMaxHP
            })
        })
    },

    async checkEvolution(niveau) {
        const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${this.playerPokemon.id}`)
        const speciesData = await speciesRes.json()
        
        const chainRes = await fetch(speciesData.evolution_chain.url)
        const chainData = await chainRes.json()

        const findEvolution = (chain, targetName) => {
            if (chain.species.name === targetName || chain.species.url.includes(`/${this.playerPokemon.id}/`)) {
                for (const evo of chain.evolves_to) {
                    const detail = evo.evolution_details[0]
                    if (detail?.trigger?.name === "level-up" && detail?.min_level <= niveau) {
                        return evo.species.name
                    }
                }
            }
            for (const evo of chain.evolves_to) {
                const result = findEvolution(evo, targetName)
                if (result) return result
            }
            return null
        }

        return findEvolution(chainData.chain, null)
    },

    async capture() {
        const capitalize = name => name.charAt(0).toUpperCase() + name.slice(1)
        await this.saveHP()
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${this.encounter.id}`)
        const data = await response.json()
        const moves = data.moves.slice(0, 4).map(m => m.move.name)
        const maxHP = data.stats.find(s => s.stat.name === "hp").base_stat

        const teamResponse = await fetch("http://localhost:3000/api/team")
        const team = await teamResponse.json()
        const endpoint = team.length >= 6 ? "http://localhost:3000/api/pc" : "http://localhost:3000/api/team"

        await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                pokemon: capitalize(data.name),
                id: this.encounter.id,
                niveau: this.encounter.niveau,
                moves,
                xp: 0,
                currentHP: maxHP,
                maxHP
            })
        })
        window.dispatchEvent(new CustomEvent("endBattle"))
    }
}