export const BattleLogicMixin = {

    getBestEnemyMove() {
        let bestMove = this.enemyMoves[0]
        let bestDamage = 0

        for (const move of this.enemyMoves) {
            const power = this.enemyMovePower[move] || 0
            if (power === 0) continue

            const isSpecial = this.enemyMoveClass[move] === "special"
            const atk = isSpecial ? this.enemySpecialAttack : this.enemyAttack
            const def = isSpecial ? this.playerSpecialDefense : this.playerDefense

            const damage = Math.floor(
                ((2 * this.encounter.niveau / 5 + 2) * atk / def / 50 + 2)
            )

            if (damage > bestDamage) {
                bestDamage = damage
                bestMove = move
            }
        }

        return bestMove
    },

    async getEffectiveness(moveType, defenderTypes) {
        let multiplier = 1
        const res = await fetch(`https://pokeapi.co/api/v2/type/${moveType}`)
        const data = await res.json()
        const relations = data.damage_relations

        for (const defType of defenderTypes) {
            if (relations.double_damage_to.find(t => t.name === defType)) multiplier *= 2
            if (relations.half_damage_to.find(t => t.name === defType))   multiplier *= 0.5
            if (relations.no_damage_to.find(t => t.name === defType))     multiplier *= 0
        }
        return multiplier
    },

    async attack(moveName, isEnemy = false) {
        const attacker = isEnemy ? `${this.encounter.pokemon} ennemi` : this.playerPokemon.pokemon
        const niveau = isEnemy ? this.encounter.niveau : this.playerPokemon.niveau
        const atk = isEnemy ? this.enemyAttack : this.playerAttack
        const atkSpe = isEnemy ? this.enemySpecialAttack : this.playerSpecialAttack
        const def = isEnemy ? this.playerDefense : this.enemyDefense
        const defSpe = isEnemy ? this.playerSpecialDefense : this.enemySpecialDefense

        const isSpecial = isEnemy ? this.enemyMoveClass[moveName] === "special" : this.moveClass[moveName] === "special"
        const finalAtk = isSpecial ? atkSpe : atk
        const finalDef = isSpecial ? defSpe : def

        const moveType = isEnemy ? this.enemyMoveTypes[moveName] : this.moveTypes[moveName]
        const defenderTypes = isEnemy ? this.playerTypes : this.enemyTypes
        const attackerTypes = isEnemy ? this.enemyTypes : this.playerTypes

        const power = isEnemy ? this.enemyMovePower[moveName] : this.movePower[moveName]
        const effectiveness = await this.getEffectiveness(moveType, defenderTypes)
        const stab = attackerTypes?.includes(moveType) ? 1.5 : 1
        const damage = Math.floor(
            ((2 * niveau / 5 + 2) * power * finalAtk / finalDef / 50 + 2) * effectiveness * stab
        )

        this.message = `${attacker} utilise ${moveName.replace(/-/g, ' ').toUpperCase()} !`

        if (isEnemy) {
            this.playerCurrentHP -= damage
            if (this.playerCurrentHP < 0) this.playerCurrentHP = 0
        } else {
            this.enemyCurrentHP -= damage
            if (this.enemyCurrentHP < 0) this.enemyCurrentHP = 0
        }

        await new Promise(r => setTimeout(r, 1000))

        if (effectiveness > 1) this.message = "C'est super efficace !"
        else if (effectiveness < 1) this.message = "Ce n'est pas très efficace..."
        await new Promise(r => setTimeout(r, 1000))
    },

    async useMove(moveName) {
        this.animating = true
        const power = this.movePower[moveName]
        if (!power) {
            this.animating = false
            return
        }

        const playerFirst = this.playerSpeed >= this.enemySpeed
        const enemyMove = this.getBestEnemyMove()

        if (playerFirst) {
            await this.attack(moveName, false)
            if (this.enemyCurrentHP > 0) await this.attack(enemyMove, true)
        } else {
            await this.attack(enemyMove, true)
            if (this.playerCurrentHP > 0) await this.attack(moveName, false)
        }

        this.animating = false
        this.message = null
    },

    async loadNextTrainerPokemon(poke) {

        const calcStat = (base, niveau) => Math.floor((2 * base * niveau) / 100) + 5
        const capitalize = name => name.charAt(0).toUpperCase() + name.slice(1)
        this.enemySprite = await this.loadImage(`./assets/pokemon/dp/shiny/${poke.id}.png`)
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${poke.id}`)
        const data = await res.json()

        this.encounter.pokemon = capitalize(data.name)
        const stats = data.stats
        this.enemyTypes          = data.types.map(t => t.type.name)
        this.enemyMaxHP          = Math.floor((2 * stats.find(s => s.stat.name === "hp").base_stat * poke.niveau) / 100) + poke.niveau + 10
        this.enemyAttack         = calcStat(stats.find(s => s.stat.name === "attack").base_stat, poke.niveau)
        this.enemyDefense        = calcStat(stats.find(s => s.stat.name === "defense").base_stat, poke.niveau)
        this.enemySpecialAttack  = calcStat(stats.find(s => s.stat.name === "special-attack").base_stat, poke.niveau)
        this.enemySpecialDefense = calcStat(stats.find(s => s.stat.name === "special-defense").base_stat, poke.niveau)
        this.enemySpeed          = calcStat(stats.find(s => s.stat.name === "speed").base_stat, poke.niveau)
        this.enemyDisplayHP      = this.enemyMaxHP
        this.enemyCurrentHP      = this.enemyMaxHP

        this.enemyMoves = data.moves.filter(m => m.version_group_details.some(
            v => v.move_learn_method.name === "level-up" &&
                v.level_learned_at <= poke.niveau &&
                v.level_learned_at > 0
        )).map(m => m.move.name).slice(0, 4)
        if (this.enemyMoves.length === 0) {
            this.enemyMoves = data.moves.slice(0, 1).map(m => m.move.name)
        }
        this.enemyMovePower = {}
        this.enemyMoveClass = {}
        this.enemyMoveTypes = {}
        await Promise.all(this.enemyMoves.map(async (move) => {
            const res = await fetch(`https://pokeapi.co/api/v2/move/${move}`)
            const d = await res.json()
            this.enemyMovePower[move] = d.power || 0
            this.enemyMoveClass[move] = d.damage_class.name
            this.enemyMoveTypes[move] = d.type.name
        }))
    }
}