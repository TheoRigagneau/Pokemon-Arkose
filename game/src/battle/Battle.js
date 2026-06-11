import { BattleDataMixin }  from "./BattleData.js"
import { BattleLogicMixin } from "./BattleLogic.js"
import { BattleUIMixin }    from "./BattleUI.js"
import { BattleTeamMixin }  from "./BattleTeam.js"

export default class Battle {

    constructor(ctx, canvas, encounter) {
        this.ctx = ctx
        this.canvas = canvas
        this.encounter = encounter
        this.enemyDisplayHP = this.enemyMaxHP
        this.currentMenu = "main"
        this.message = null
        this.messageTimer = 0
        this.ready = false
        this.animating = false
        this.selectedPokemon = null
        this.forcedSwitch = false
        this.playerDefeated = false
        this.selectedItem = null

        this.keyHandler = (event) => {
            if (event.key === "a") {
                this.enemyCurrentHP -= 10
                if (this.enemyCurrentHP < 0) this.enemyCurrentHP = 0
            }
            if (event.key === "v") {
                this.playerCurrentHP -= 10
                if (this.playerCurrentHP < 0) this.playerCurrentHP = 0
            }
        }
        window.addEventListener("keydown", this.keyHandler)

        this.clickHandler = async (e) => {
            if (this.animating) return
            const rect = this.canvas.getBoundingClientRect()
            const mouseX = e.clientX - rect.left
            const mouseY = e.clientY - rect.top
            
            const w = this.canvas.width
            const h = this.canvas.height
            const bw = w * 0.32
            const bh = h * 0.1

            if (this.currentMenu !== "main" && this.currentMenu !== "fight" && this.currentMenu !== "pokemon") {
                const backX = w * 0.85
                const backY = h * 0.62
                const backW = w * 0.12
                const backH = h * 0.06
                
                if (mouseX >= backX && mouseX <= backX + backW &&
                    mouseY >= backY && mouseY <= backY + backH) {
                    this.currentMenu = "main"
                    return
                }
            }

            if (this.currentMenu === "bag") {
                const backX = w * 0.91
                const backY = h * 0.02
                const backW = w * 0.08
                const backH = h * 0.06
                if (mouseX >= backX && mouseX <= backX + backW &&
                    mouseY >= backY && mouseY <= backY + backH) {
                    this.currentMenu = "main"
                    return
                }

                const healItems = this.inventory?.filter(inv => {
                    const item = this.items?.find(i => i.name === inv.itemName)
                    return item?.type === "heal" || item?.type === "revive"
                }) ?? []

                healItems.forEach((inv, i) => {
                    const x = w * 0.04
                    const y = h * 0.2 + i * h * 0.12
                    if (mouseX >= x && mouseX <= x + w * 0.42 &&
                        mouseY >= y && mouseY <= y + h * 0.1) {
                        if (inv.quantity > 0) {
                            this.selectedItem = inv
                            this.currentMenu = "pokemon"
                        }
                    }
                })

                const ballItems = this.inventory?.filter(inv => {
                    const item = this.items?.find(i => i.name === inv.itemName)
                    return item?.type === "pokeball"
                }) ?? []

                ballItems.forEach((inv, i) => {
                    const x = w * 0.54
                    const y = h * 0.2 + i * h * 0.12
                    if (mouseX >= x && mouseX <= x + w * 0.42 &&
                        mouseY >= y && mouseY <= y + h * 0.1) {
                        if (inv.quantity > 0) this.capture()
                    }
                })
                return
            }

            if (this.currentMenu === "fight") {
                const backW = w * 0.08
                const backH = h * 0.11
                const backX = w * 0.46
                const backY = h * 0.845

                if (mouseX >= backX && mouseX <= backX + backW &&
                    mouseY >= backY && mouseY <= backY + backH) {
                    this.currentMenu = "main"
                    return
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

                    if (mouseX >= bx && mouseX <= bx + bw &&
                        mouseY >= by && mouseY <= by + bh) {
                        this.useMove(this.playerPokemon.moves[i])
                        this.currentMenu = "main"
                        return
                    }
                }
                return
            }

            if (this.currentMenu === "main") {
                const buttons = [
                    { label: "COMBAT",  x: w * 0.3, y: h * 0.79 },
                    { label: "SAC",     x: w * 0.7, y: h * 0.79 },
                    { label: "POKEMON", x: w * 0.3, y: h * 0.92 },
                    { label: "FUITE",   x: w * 0.7, y: h * 0.92 },
                ]
                
                for (const btn of buttons) {
                    if (mouseX >= btn.x - bw/2 && mouseX <= btn.x + bw/2 &&
                        mouseY >= btn.y - bh/2 && mouseY <= btn.y + bh/2) {
                        this.handleButton(btn.label)
                    }
                }
            }

            if (this.currentMenu === "pokemon") {
                console.log("selectedItem:", this.selectedItem, "selectedPokemon:", this.selectedPokemon, "forcedSwitch:", this.forcedSwitch)
                const backX = w * 0.91
                const backY = h * 0.02
                const backW = w * 0.08
                const backH = h * 0.06

                if (mouseX >= backX && mouseX <= backX + backW &&
                    mouseY >= backY && mouseY <= backY + backH) {
                    if (this.selectedPokemon) {
                        this.selectedPokemon = null
                    } else if (this.selectedItem) {
                        this.selectedItem = null
                        this.currentMenu = "bag"
                    } else if (!this.forcedSwitch) {
                        this.currentMenu = "main"
                    }
                    return
                }

                const slots = [
                    { x: w * 0.02, y: h * 0.1 },
                    { x: w * 0.52, y: h * 0.1 },
                    { x: w * 0.02, y: h * 0.4 },
                    { x: w * 0.52, y: h * 0.4 },
                    { x: w * 0.02, y: h * 0.7 },
                    { x: w * 0.52, y: h * 0.7 },
                ]
                const sw = w * 0.46
                const sh = h * 0.26

                if (!this.selectedPokemon && !this.selectedItem) {
                    for (let i = 0; i < this.teamData.length; i++) {
                        if (!this.teamData[i]) continue
                        const isDead = (this.teamData[i].currentHP ?? 0) <= 0
                        if (isDead) continue

                        if (mouseX >= slots[i].x && mouseX <= slots[i].x + sw &&
                            mouseY >= slots[i].y && mouseY <= slots[i].y + sh) {
                            this.selectedPokemon = this.teamData[i]
                            return
                        }
                    }
                } else if (this.selectedItem) {
                    const item = this.items?.find(it => it.name === this.selectedItem.itemName)
                    
                    for (let i = 0; i < this.teamData.length; i++) {
                        if (!this.teamData[i]) continue
                        const isDead = (this.teamData[i].currentHP ?? 0) <= 0
                        const isFull = (this.teamData[i].currentHP ?? 0) >= (this.teamData[i].maxHP ?? this.playerMaxHP)

                        if (mouseX >= slots[i].x && mouseX <= slots[i].x + sw &&
                            mouseY >= slots[i].y && mouseY <= slots[i].y + sh) {
                            if (item?.type === "heal" && !isDead && !isFull) {
                                this.useItem(this.teamData[i])
                                return
                            }
                            if (item?.type === "revive" && isDead) {
                                this.useItem(this.teamData[i])
                                return
                            }
                            if (item?.type === "candy") {
                                this.useCandy(this.teamData[i])
                                return
                            }
                        }
                    }
                } else {
                    const btnX = w * 0.3
                    const btnY = h * 0.85
                    const btnW = w * 0.4
                    const btnH = h * 0.08

                    if (mouseX >= btnX && mouseX <= btnX + btnW &&
                        mouseY >= btnY && mouseY <= btnY + btnH) {
                            console.log("switch")
                        this.switchPokemon(this.selectedPokemon)
                        return
                    }
                }
                return
            }
        }
        this.canvas.addEventListener("click", this.clickHandler)
    }

    async init() {
        this.field         = await this.loadImage("./assets/battle/field_day.png")
        this.platform      = await this.loadImage("./assets/battle/grass_platform.png")
        this.enemy_hp_bar  = await this.loadImage("./assets/battle/enemy_hp_bar.png")
        this.pokemon_bar   = await this.loadImage("./assets/battle/player_hp_bar.png")
        this.slot_obj      = await this.loadImage("./assets/battle/fond_objets.png")
        this.background    = await this.loadImage("./assets/battle/bg_obj.png")
        this.attackSprite  = await this.loadImage("./assets/battle/attack_sprite.png")
        this.back          = await this.loadImage("./assets/battle/back.png")
        this.waitingScreen = await this.loadImage("./assets/battle/waitingscreen.png")
        const calcStat = (base, niveau) => Math.floor((2 * base * niveau) / 100) + 5

        this.enemySprite = await this.loadImage(`./assets/pokemon/dp/shiny/${this.encounter.id}.png`)
        const enemyResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${this.encounter.id}`)
        const enemyData = await enemyResponse.json()
        const enemyStats = enemyData.stats
        this.enemyTypes          = enemyData.types.map(t => t.type.name)
        this.enemyMaxHP          = Math.floor((2 * enemyStats.find(s => s.stat.name === "hp").base_stat * this.encounter.niveau) / 100) + this.encounter.niveau + 10
        this.enemyAttack         = calcStat(enemyStats.find(s => s.stat.name === "attack").base_stat, this.encounter.niveau)
        this.enemyDefense        = calcStat(enemyStats.find(s => s.stat.name === "defense").base_stat, this.encounter.niveau)
        this.enemySpecialAttack  = calcStat(enemyStats.find(s => s.stat.name === "special-attack").base_stat, this.encounter.niveau)
        this.enemySpecialDefense = calcStat(enemyStats.find(s => s.stat.name === "special-defense").base_stat, this.encounter.niveau)
        this.enemySpeed          = calcStat(enemyStats.find(s => s.stat.name === "speed").base_stat, this.encounter.niveau)
        this.enemyMovePower = {}
        this.enemyMoveClass = {}
        this.enemyMoveTypes = {}

        const inventoryResponse = await fetch("http://localhost:3000/api/inventory")
        this.inventory = await inventoryResponse.json()

        const itemsResponse = await fetch("http://localhost:3000/api/items")
        this.items = await itemsResponse.json()

        this.enemyMoves = enemyData.moves.filter(m => m.version_group_details.some(
            v => v.move_learn_method.name === "level-up" && 
                 v.level_learned_at <= this.encounter.niveau &&
                 v.level_learned_at > 0
        )).map(m => m.move.name).slice(0, 4)
        if (this.enemyMoves.length === 0) {
            this.enemyMoves = enemyData.moves.slice(0, 1).map(m => m.move.name)
        }
        await Promise.all(this.enemyMoves.map(async (move) => {
            const res = await fetch(`https://pokeapi.co/api/v2/move/${move}`)
            const data = await res.json()
            this.enemyMovePower[move] = data.power || 0
            this.enemyMoveClass[move] = data.damage_class.name
            this.enemyMoveTypes[move] = data.type.name
        }))

        this.enemyBaseXP = enemyData.base_experience
        this.xpWin = Math.floor((this.enemyBaseXP * this.encounter.niveau) / 7)
        this.enemyDisplayHP = this.enemyMaxHP
        this.enemyCurrentHP = this.enemyMaxHP
        this.battleEnded = false

        const teamResponse = await fetch("http://localhost:3000/api/team")
        this.teamData = await teamResponse.json()
        this.teamSprites = {}
        for (const poke of this.teamData) {
            const img = await this.loadImage(`./assets/pokemon/dp/${poke.id}.png`)
            this.teamSprites[poke.id] = img
        }

        if (this.teamData.length > 0) {
            this.playerPokemon = this.teamData.find(p => (p.currentHP ?? 1) > 0) || this.teamData[0]
            this.playerSprite  = await this.loadImage(`./assets/pokemon/dp/back/${this.playerPokemon.id}.png`)

            const playerResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${this.playerPokemon.id}`)
            const playerData = await playerResponse.json()
            const playerStats = playerData.stats
            
            this.playerMaxHP          = Math.floor((2 * playerStats.find(s => s.stat.name === "hp").base_stat * this.playerPokemon.niveau) / 100) + this.playerPokemon.niveau + 10
            this.playerAttack         = calcStat(playerStats.find(s => s.stat.name === "attack").base_stat, this.playerPokemon.niveau)
            this.playerSpecialAttack  = calcStat(playerStats.find(s => s.stat.name === "special-attack").base_stat, this.playerPokemon.niveau)
            this.playerDefense        = calcStat(playerStats.find(s => s.stat.name === "defense").base_stat, this.playerPokemon.niveau)
            this.playerSpecialDefense = calcStat(playerStats.find(s => s.stat.name === "special-defense").base_stat, this.playerPokemon.niveau)
            this.playerSpeed          = calcStat(playerStats.find(s => s.stat.name === "speed").base_stat, this.playerPokemon.niveau)

            this.playerTypes          = playerData.types.map(t => t.type.name)
            this.playerCurrentHP      = this.playerPokemon.currentHP ?? this.playerMaxHP
            this.playerDisplayHP      = this.playerCurrentHP
            this.playerXpDisplay      = this.playerPokemon.xp || 0
            this.moveTypes = {}
            this.movePower = {}
            this.moveClass = {}
            await Promise.all(this.playerPokemon.moves.map(async (move) => {
                const res  = await fetch(`https://pokeapi.co/api/v2/move/${move}`)
                const data = await res.json()
                this.moveTypes[move] = data.type.name
                this.movePower[move] = data.power || 0
                this.moveClass[move] = data.damage_class.name
            }))
        }
        this.ready = true
    }

    destroy() {
        this.canvas.removeEventListener("click", this.clickHandler)
        window.removeEventListener("keydown", this.keyHandler)
    }

    handleButton(label) {
        this.message = null
        if (label === "COMBAT")  this.currentMenu = "fight"
        if (label === "SAC")     this.currentMenu = "bag"
        if (label === "POKEMON") this.currentMenu = "pokemon"
        if (label === "FUITE") {
            if (this.encounter.isTrainer) return
            this.saveHP()
            window.dispatchEvent(new CustomEvent("endBattle"))
        }
    }

    update() {
        if (this.enemyDisplayHP > this.enemyCurrentHP) {
            this.enemyDisplayHP -= 0.5
            if (this.enemyDisplayHP < this.enemyCurrentHP) this.enemyDisplayHP = this.enemyCurrentHP
        }
        if (this.playerDisplayHP > this.playerCurrentHP) {
            this.playerDisplayHP -= 0.5
            if (this.playerDisplayHP < this.playerCurrentHP) this.playerDisplayHP = this.playerCurrentHP
        }
        if (this.xpTarget !== undefined && this.playerXpDisplay < this.xpTarget) {
            this.playerXpDisplay += 0.5
            if (this.playerXpDisplay > this.xpTarget) this.playerXpDisplay = this.xpTarget
        }

        if (this.messageTimer > 0) {
            this.messageTimer--
            if (this.messageTimer <= 0) this.message = null
        }

        if (this.playerCurrentHP <= 0 && !this.battleEnded && !this.playerDefeated) {
            this.playerDefeated = true
            const hasAlive = this.teamData?.some(p => 
                p._id !== this.playerPokemon._id && (p.currentHP ?? 0) > 0
            )
            if (hasAlive) {
                this.currentMenu = "pokemon"
                this.forcedSwitch = true
            } else {
                this.battleEnded = true
                this.saveHP()
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent("endBattle"))
                }, 1000)
            }
        }

        if (this.enemyCurrentHP <= 0 && !this.battleEnded) {
            if (this.encounter.isTrainer) {
                const nextIndex = (this.encounter.currentTrainerPokeIndex ?? 0) + 1
                if (nextIndex < this.encounter.trainerPokemons.length) {
                    if (this.enemyDisplayHP > 0) return
                    this.encounter.currentTrainerPokeIndex = nextIndex
                    const nextPoke = this.encounter.trainerPokemons[nextIndex]
                    this.encounter.id = nextPoke.id
                    this.encounter.niveau = nextPoke.niveau
                    this.loadNextTrainerPokemon(nextPoke).then(() => {
                        this.animating = false
                        this.message = null
                    })
                    return
                }
            }
            this.battleEnded = true
            this.xpAnimating = true
            this.giveXP(this.xpWin)
            this.saveHP()
            
            const waitForXP = setInterval(() => {
                if (this.xpTarget !== undefined && 
                    Math.abs(this.playerXpDisplay - this.xpTarget) < 1) {
                    clearInterval(waitForXP)
                    setTimeout(() => {
                        this.xpAnimating = false
                        window.dispatchEvent(new CustomEvent("endBattle"))
                    }, 1000)
                }
            }, 16)
        }
    }
}

Object.assign(Battle.prototype, BattleDataMixin, BattleLogicMixin, BattleUIMixin, BattleTeamMixin)