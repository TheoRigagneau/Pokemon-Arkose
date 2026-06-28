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
        //cherche l'item selectionné
        const item = this.items?.find(i => i.name === this.selectedItem.itemName)
        if (!item) return

        let newHP = targetPoke.currentHP ?? 0

        if (item.type === "heal") {
            //heal en fonction de la potion
            //si poke dans la team, heal en fonction de maxhp de la db
            const pokeMaxHP = targetPoke._id === this.playerPokemon._id ? this.playerMaxHP : (targetPoke.maxHP ?? this.playerMaxHP)
            newHP = Math.min(newHP + item.healAmount, pokeMaxHP)
        } 
        else if (item.type === "revive") {
            newHP = Math.floor(this.playerMaxHP / 2)
        }
        //mets a jour dans la db sa vie actuel
        await fetch(`http://localhost:3000/api/team/${targetPoke._id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentHP: newHP })
        })
        //supprime l'item utilisé dans la db
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

        //le tour du joueur est passé dcp le poke adverse attaque
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
            //remet a 0 la barre d'xp
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
            v.move_learn_method.name === "level-up" && // s'apprennent par monté de niveau et vérifie si à ce niveau
            v.level_learned_at === newNiveau)).map(m => m.move.name) //le poké en apprends une

            if (newMoves.length > 0) {
                this.pendingMove = newMoves[0]
            }
        }
        const evoName = await this.checkEvolution(newNiveau)
        if (evoName) {
            //fait évoluer le pokémon
            const capitalize = name => name.charAt(0).toUpperCase() + name.slice(1)
            this.message = `${this.playerPokemon.pokemon} évolue en ${capitalize(evoName).toUpperCase()} !`
            this.messageTimer = 180

            const evoRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${evoName}`)
            const evoData = await evoRes.json()
            const evoMaxHP = Math.floor((2 * evoData.stats.find(s => s.stat.name === "hp").base_stat * newNiveau) / 100) + newNiveau + 10
            //change le poké dans la db
            await fetch(`http://localhost:3000/api/team/${this.playerPokemon._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pokemon: capitalize(evoName),
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
        //remet toutes les infos du poké à jour
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
        //regarde si le poké peut évoluer à ce niveau
        const findEvolution = (chain, targetName) => {
            if (chain.species.name === targetName || chain.species.url.includes(`/${this.playerPokemon.id}/`)) {
                for (const evo of chain.evolves_to) {
                    const detail = evo.evolution_details[0]
                    //vérifie que son évo se fait bien par level-up
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

        const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${this.encounter.id}`)
        const speciesData = await speciesRes.json()

        const catchRate = speciesData.capture_rate
        const hpPercent = this.enemyCurrentHP / this.enemyMaxHP
        const catchChance = (catchRate / 255) * (1 - hpPercent * 0.5)
        const success = Math.random() < catchChance //calcul le taut de capture du poke

        if (!success) {
            this.animating = true
            this.currentMenu = "main"
            this.message = "Oh non ! Le Pokémon s'est échappé !"
            await new Promise(r => setTimeout(r, 2000))
            
            this.message = null
            this.selectedItem = null
            
            await fetch(`http://localhost:3000/api/inventory/${encodeURIComponent("Pokéball")}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity: -1 })
            })

            const enemyMove = this.getBestEnemyMove()
            await this.attack(enemyMove, true)
            this.animating = false
            this.message = null
            return
        }

        const moves = data.moves.slice(0, 4).map(m => m.move.name) //donne des attaques au poké
        const baseHP = data.stats.find(s => s.stat.name === "hp").base_stat
        const maxHP = Math.floor((2 * baseHP * this.encounter.niveau) / 100) + this.encounter.niveau + 10

        const teamResponse = await fetch("http://localhost:3000/api/team")
        const team = await teamResponse.json()
        //si il y a plus de 6 poké dans la team, on le mets au pc
        const endpoint = team.length >= 6 ? "http://localhost:3000/api/pc" : "http://localhost:3000/api/team"
        //toute ses infos sont transférés dans la db
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
                currentHP: this.enemyCurrentHP,
                maxHP
            })
        })
        //retire la ball utilisé du sac
        await fetch(`http://localhost:3000/api/inventory/${encodeURIComponent("Pokéball")}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: -1 })
        })

        window.dispatchEvent(new CustomEvent("endBattle"))
    }
}