import Player from "./Player.js"
import Assets from "./Assets.js"
import { ASSETS } from "./assets_config.js"
import DialogBox from "./DialogBox.js"
import Transition from "./animations/Transition.js"
import zoneTransition from "./animations/zonetransition.js"
import Battle from "./battle/Battle.js"
import Inventory from "./inventory/Inventory.js"
import Audiogame from "./Audio.js"

class GameView {
    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
        this.ctx = this.canvas.getContext("2d");
        this.uiCanvas = document.getElementById("uiCanvas");
        this.uiCtx = this.uiCanvas.getContext("2d")
        this.uiCanvas.width = window.innerWidth
        this.uiCanvas.height = window.innerHeight
        this.transitionCanvas = document.getElementById("transitionCanvas");
        this.trCtx = this.transitionCanvas.getContext("2d");
        this.transitionCanvas.width = window.innerWidth
        this.transitionCanvas.height = window.innerHeight
        this.grassAnimations = [];
        
        window.addEventListener("resize", () => {
            this.canvas.width = window.innerWidth
            this.canvas.height = window.innerHeight
            this.uiCanvas.width = window.innerWidth
            this.uiCanvas.height = window.innerHeight
            this.transitionCanvas.width = window.innerWidth
            this.transitionCanvas.height = window.innerHeight
        })

    }
    async loadMap(path) {
        const ville1 = await fetch(path);
        const Boscalis =await ville1.json();
        this.map = Boscalis;
    }

    buildOffscreenCanvas(excludedLayers) {
    const canvas = document.createElement("canvas")
    canvas.width = this.map.width * this.map.tilewidth;
    canvas.height = this.map.height * this.map.tileheight;
    const ctx =canvas.getContext("2d")
    //en fonction des infos de tiles, réalise des action
    for (const layer of this.map.layers) {
            if (layer.type === "tilelayer" && !excludedLayers.includes(layer.name)) {
                const startTileX = 0;
                const endTileX = this.map.width;
                const startTileY = 0;
                const endTileY = this.map.height;
                
                for (let line = startTileY; line < endTileY; line++) {
                    for (let column = startTileX; column < endTileX; column++) {
                        const i = line * this.map.width + column
                        const tileId = layer.data[i]

                        if (tileId !== 0) {
                            const x = column * this.map.tilewidth;
                            const y = line * this.map.tileheight;

                            let tileset = this.tileset
                            let tilesetColumns = 16
                            let localTileId = tileId

                            const tilesetInfo = [...this.map.tilesets].reverse().find(ts => tileId >= ts.firstgid)
                            if (tilesetInfo) {

                                //load les sprites des tilesheets
                                const source = tilesetInfo.source
                                if (source.includes("house2")) {
                                    tileset = this.assets.get("house2")
                                    localTileId = tileId - tilesetInfo.firstgid + 1
                                } else if (source.includes("grass")) {
                                    tileset = this.assets.get("herbe")
                                    tilesetColumns = tileset.width / 16
                                    localTileId = tileId - tilesetInfo.firstgid + 1
                                } else if (source.includes("house")) {
                                    tileset = this.assets.get("house")
                                    localTileId = tileId - tilesetInfo.firstgid + 1
                                } else if (source.includes("sprites")) {
                                    tileset = this.assets.get("tileset")
                                    localTileId = tileId - tilesetInfo.firstgid + 1
                                }
                            }
                            const tilesetX = ((localTileId - 1) % tilesetColumns) * 16
                            const tilesetY = Math.floor((localTileId - 1) / tilesetColumns) * 16
                            ctx.drawImage(tileset, tilesetX, tilesetY, 16, 16, x, y, this.map.tilewidth, this.map.tileheight)

                        }
                    }
                }
            }
        }
        return canvas
    }

    drawDynamicLayers() {
        for (const layer of this.map.layers) {
            if (layer.name === "fleur" || layer.name === "fleur2") {
                //tuilles visible à l'écran
                const startTileX = Math.max(0,Math.floor((this.player.renderX - this.canvas.width / 2) / this.map.tilewidth));
                const endTileX = Math.min(this.map.width,Math.ceil((this.player.renderX + this.canvas.width / 2) / this.map.tilewidth));
                const startTileY = Math.max(0,Math.floor((this.player.renderY - this.canvas.height / 2) / this.map.tileheight));
                const endTileY = Math.min(this.map.height, Math.ceil((this.player.renderY + this.canvas.height / 2) / this.map.tileheight));
                
                //dessine ces tuilles
                for (let line = startTileY; line < endTileY; line++) {
                    for (let column = startTileX; column < endTileX; column++) {
                        const i = line * this.map.width + column
                        const tileId = layer.data[i]

                        if (tileId !== 0) {
                            const x = column * this.map.tilewidth;
                            const y = line * this.map.tileheight;

                            let tileset = this.tileset
                            let tilesetColumns = 16
                            let localTileId = tileId

                            const tilesetInfo = [...this.map.tilesets].reverse().find(ts => tileId >= ts.firstgid)
                            if (tilesetInfo) {
                                const source = tilesetInfo.source
                                if (source.includes("house2")) {
                                    tileset = this.assets.get("house2")
                                    localTileId = tileId - tilesetInfo.firstgid + 1
                                } else if (source.includes("grass")) {
                                    tileset = this.assets.get("herbe")
                                    tilesetColumns = tileset.width / 16
                                    localTileId = tileId - tilesetInfo.firstgid + 1
                                } else if (source.includes("house")) {
                                    tileset = this.assets.get("house")
                                    localTileId = tileId - tilesetInfo.firstgid + 1
                                }
                            }
                            const tilesetX = ((localTileId - 1) % tilesetColumns) * 16
                            const tilesetY = Math.floor((localTileId - 1) / tilesetColumns) * 16
                            
                            this.ctx.drawImage(tileset, tilesetX, tilesetY, 16, 16, x, y, this.map.tilewidth, this.map.tileheight)

                        }
                    }
                }
            }
        }
    }
    drawNPCs() {
        for (const layer of this.map.layers) {
            if (layer.name === "PNJ") {
                for (const obj of layer.objects) {
                    const props = Object.fromEntries(obj.properties?.map(p => [p.name, p.value]) ?? [])
                    //si le pnj est en train de marcher, on le dessine pas a son endroit de base
                    if (this.trainerWalkAnim && props.pnjID == this.trainerWalkAnim.pnjID) continue

                    const spriteKey = obj.properties?.find(p => p.name === "sprite")?.value
                    const direction = obj.forcedDirection ?? obj.properties?.find(p => p.name === "direction")?.value ?? "south"
                    const sprite = this.assets.get(spriteKey)

                    //ou regarde le pnj
                    if (sprite) {
                        const directionRow = {
                            south: 3,
                            north: 0,
                            east: 1,
                            west: 2
                        }[direction] ?? 3

                        const row = directionRow
                        this.ctx.drawImage(sprite, 0, row * 64, 64, 64, obj.x - 32, obj.y - 32, 64, 64)
                    }
                }
            }
        }
        if (this.trainerWalkAnim) {
            //déplacement du dresseur
            const sprite = this.assets.get(this.trainerWalkAnim.spriteKey)
            if (sprite) {
                const dx = this.trainerWalkAnim.targetX - this.trainerWalkAnim.x
                const dy = this.trainerWalkAnim.targetY - this.trainerWalkAnim.y
                let row = 0
                if (Math.abs(dy) > Math.abs(dx)) {
                    row = dy > 0 ? 0 : 3
                } else {
                    row = dx > 0 ? 2 : 1
                }
                this.ctx.drawImage(sprite, 0, row * 64, 64, 64,
                    this.trainerWalkAnim.x - 32,
                    this.trainerWalkAnim.y - 32,
                    64, 64)
            }
        }
    }
    drawGrassAnimations() {
        //déplacement de l'herbe pour avoir une animation
        for (const anim of this.grassAnimations) {
            anim.timer = (anim.timer || 0) + 1
            if (anim.timer % 4 === 0) {
                anim.frame++}
            const x = anim.tileX * 32
            const y = anim.tileY * 32
            const sx = anim.frame * 32
            this.ctx.drawImage(this.assets.get("herbe"), sx, 0, 32, 32, x - 15, y, 32, 32)
        }
        this.grassAnimations = this.grassAnimations.filter(a => a.timer < 32)
    }

    gameLoop() {
        //boucle pour faire tourner le jeu

        //écran de démarage
        if (this.waitingForInteraction) {
            this.ctx.fillStyle = "#1a1a2e"
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
            this.ctx.fillStyle = "white"
            this.ctx.font = "bold 20px 'Press Start 2P'"
            this.ctx.textAlign = "center"
            this.ctx.fillText("Appuie sur ESPACE pour jouer", this.canvas.width / 2, this.canvas.height / 2)
            this.ctx.textAlign = "left"
            requestAnimationFrame(() => this.gameLoop())
            return
        }

        //dessine la page battle
        if (this.battle) {
            this.uiCtx.clearRect(0, 0, this.uiCanvas.width, this.uiCanvas.height)
            this.trCtx.clearRect(0, 0, this.transitionCanvas.width, this.transitionCanvas.height)
            this.battle.update()
            this.battle.draw()
        } 
        
        //dessine la map en elle-même
        else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
            this.ctx.fillStyle = "#1a1a1a"
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

            const zoom = 2
            const camX = this.canvas.width / (2 * zoom) - this.player.renderX
            const camY = this.canvas.height / (2 * zoom) - this.player.renderY

            this.ctx.save()
            this.ctx.scale(zoom, zoom)
            this.ctx.translate(camX, camY)
                    
            this.ctx.drawImage(this.offscreenBottom, 0, 0);
            this.drawDynamicLayers();
            this.ctx.drawImage(this.offscreenTop, 0, 0);
            this.drawNPCs();
                
            this.player.move();
            this.player.animate();
            this.drawGrassAnimations();
            this.player.draw(this.ctx, this.playerWalkSprite, this.playerRunSprite);
            this.ctx.drawImage(this.offscreenUp, 0, 0);

            this.ctx.restore();
            this.uiCtx.clearRect(0, 0, this.uiCanvas.width, this.uiCanvas.height)
            this.transition.update();
            this.transition.draw(this.uiCtx, this.uiCanvas);
            this.dialogBox.draw();
            this.inventory.draw();
            this.zoneTransition.update();
            this.zoneTransition.draw(this.uiCtx,this.transitionCanvas);


        }
        requestAnimationFrame(() => this.gameLoop());
    }

    async init() {
        window.game = game
        this.waitingForInteraction = true

        this.audio = new Audiogame()
        this.audio.load("map",     "./assets/music/map.mp3")
        this.audio.load("wild",  "./assets/music/wild.mp3")
        this.audio.load("trainer", "./assets/music/trainer.mp3")
        this.audio.load("center",  "./assets/music/center.mp3")

        this.assets = new Assets()
        for (const asset of ASSETS) {
            await this.assets.load(asset.key, asset.path)
        }

        this.tileset = this.assets.get("tileset")

        const saveRes = await fetch("http://localhost:3000/api/save")
        const save = await saveRes.json()

        this.inventory = new Inventory(this.uiCanvas, this.uiCtx, this.assets)

        //regarde s'il y a une save pour la reprendre
        if (save) {
            await this.loadMap(`./assets/maps/${save.map}.json`)
            this.currentMap = save.map
            if (save.volume !== undefined) {
                this.audio.setVolume(save.volume)
                this.inventory.settingsVolume = save.volume
            }
        } 
        

        else {
            await this.loadMap("./assets/maps/Boscalis.json")
            this.currentMap = "Boscalis"
        }

        //objets sous le joueur
        this.offscreenBottom = this.buildOffscreenCanvas(["Maison", "Arbre 1", "Arbre2", "tapis", "eau", "Ombre", "Pancarte", "collisions", "fleur", "fleur2", "herbe", "mur", "obj", "table", "vitre", "muret", "pokeball"])
        //même niveau que le joueur
        this.offscreenTop    = this.buildOffscreenCanvas(["Sol", "fleur", "fleur2", "mur", "obj", "table", "vitre", "pokeball"])
        //au dessus du joueur
        this.offscreenUp     = this.buildOffscreenCanvas(["Sol", "Maison", "collisions", "Arbre 1", "Arbre2", "tapis", "eau", "noigrume", "Ombre", "Pancarte", "fleur", "fleur2", "pokeball_invisible", "Ombre2", "PNJ", "transition", "herbe", "tapis", "muret"])

        this.playerWalkSprite = this.assets.get("playerWalk")
        this.playerRunSprite  = this.assets.get("playerRun")
        this.dialogBox        = new DialogBox()
        this.zoneTransition   = new zoneTransition()
        this.transition       = new Transition()

        const startX = save ? save.x : 2176
        const startY = save ? save.y : 1024
        //création du perso
        this.player = new Player(1, "Joueur", "./assets/tilesets/png/npc_198_Lucas.png", [startX, startY], this.map, this.dialogBox, this.transition, this.zoneTransition)
        if (save) this.player.direction = save.direction

        //récupère les coordonnées du clique
        this.uiCanvas.addEventListener("click", (e) => {
            const rect = this.uiCanvas.getBoundingClientRect()
            this.inventory.handleClick(e.clientX - rect.left, e.clientY - rect.top)
        })


        window.addEventListener("keydown", (e) => {
            if (this.waitingForInteraction && e.key === " ") {
                this.waitingForInteraction = false
                this.audio.play("map")
                return
            }

            if (this.inventory.isOpen) {
                this.inventory.handleKey(e.key.toLowerCase())
                return
            }

            //attend la fin du déplacement du perso
            if (e.key === "x" && !this.player.inBattle && !this.dialogBox.isOpen) {
                const waitForStop = setInterval(() => {
                    if (!this.player.isMoving) {
                        clearInterval(waitForStop)
                        this.inventory.toggle()
                        this.player.inventoryOpen = this.inventory.isOpen
                        this.player.inputState.up = false
                        this.player.inputState.down = false
                        this.player.inputState.left = false
                        this.player.inputState.right = false
                    }
                }, 16)
            }
        })

        window.addEventListener("inventoryClose", () => {
            this.player.inventoryOpen = false
        })

        window.addEventListener("changeMap", async (e) => {
            this.transition.start(async () => {
                this.currentMap = e.detail.destination
                this.dialogBox.isOpen = false
                await this.loadMap(`./assets/maps/${e.detail.destination}.json`)
                //objets sous le joueur
                this.offscreenBottom = this.buildOffscreenCanvas(["Maison", "Arbre 1", "Arbre2", "tapis", "eau", "Ombre", "Pancarte", "collisions", "fleur", "fleur2", "herbe", "mur", "obj", "table", "vitre", "muret", "pokeball"])
                //même niveau que le joueur
                this.offscreenTop    = this.buildOffscreenCanvas(["Sol", "fleur", "fleur2", "mur", "obj", "table", "vitre", "pokeball"])
                //au dessus du joueur
                this.offscreenUp     = this.buildOffscreenCanvas(["Sol", "Maison", "collisions", "Arbre 1", "Arbre2", "tapis", "eau", "noigrume", "Ombre", "Pancarte", "fleur", "fleur2", "pokeball_invisible", "Ombre2", "PNJ", "transition", "herbe", "tapis", "muret"])
                this.player.map = this.map
                this.player.renderX = e.detail.spawnX
                this.player.renderY = e.detail.spawnY
            })
            if (e.detail.destination === "centre_pokemon") {
                this.audio.play("center")
            } else {
                this.audio.play("map")
            }
        })

        //animation de l'herbe
        window.addEventListener("grassStep", (e) => {
            const exists = this.grassAnimations.find(a => a.tileX === e.detail.tileX && a.tileY === e.detail.tileY)
            if (!exists) {
                this.grassAnimations.push({ tileX: e.detail.tileX, tileY: e.detail.tileY, frame: 0 })
            }
        })

        window.addEventListener("startbattle", async (e) => {
            //ajoute le pokemon au pokedex
            await fetch("http://localhost:3000/api/pokedex", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pokemonId: e.detail.id, pokemon: e.detail.pokemon })
            })
            this.zoneTransition.active = false
            this.currentEncounter = { pokemon: e.detail.pokemon, id: e.detail.id, niveau: e.detail.niveau }
            this.player.inBattle = true
            //lance le combat
            this.audio.play("wild")
            this.transition.start(async () => {
                this.battle = new Battle(this.ctx, this.canvas, this.currentEncounter)
                await this.battle.init()
            })
        })

        window.addEventListener("trainerBattle", async (e) => {
             console.log("trainerBattle reçu", e.detail)
                console.log("currentBadgeId:", e.detail.badgeId)
            if (this.player.inBattle) return
            this.player.inBattle = true
            this.audio.play("trainer")
            this.currentTrainerId = e.detail.pnjID
            this.currentBadgeId = e.detail.badgeId ?? null
            //récupère les infos du trainers en fonction de son id



            let trainerObj = null
            for (const layer of this.map.layers) {
                if (layer.name === "PNJ") {
                    //via l'id, anime le déplacement du pnj
                    trainerObj = layer.objects.find(obj => {
                        const props = Object.fromEntries(obj.properties?.map(p => [p.name, p.value]) ?? [])
                        return props.pnjID == e.detail.pnjID
                    })
                }
            }

            if (trainerObj) {
                //crée l'animation
                this.trainerWalkAnim = {
                    x: trainerObj.x,
                    y: trainerObj.y,
                    targetX: this.player.renderX,
                    targetY: this.player.renderY,
                    spriteKey: trainerObj.properties?.find(p => p.name === "sprite")?.value,
                    pnjID: e.detail.pnjID
                }

                await new Promise(resolve => {
                    const walk = setInterval(() => {
                        const dx = this.trainerWalkAnim.targetX - this.trainerWalkAnim.x
                        const dy = this.trainerWalkAnim.targetY - this.trainerWalkAnim.y
                        const dist = Math.sqrt(dx * dx + dy * dy)

                        if (dist <= 32) {
                            clearInterval(walk)
                            resolve()
                            return
                        }

                        this.trainerWalkAnim.x += (dx / dist) * 2
                        this.trainerWalkAnim.y += (dy / dist) * 2
                    }, 16)
                })
            }

            //récupère le premier pokemon du dresseur
            const firstPoke = e.detail.pokemons[0]
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${firstPoke.id}`)
            const data = await res.json()
            const capitalize = name => name.charAt(0).toUpperCase() + name.slice(1)

            setTimeout(() => {
                this.transition.start(async () => {
                    this.battle = new Battle(this.ctx, this.canvas, {
                        pokemon: capitalize(data.name),
                        id: firstPoke.id,
                        niveau: firstPoke.niveau,
                        isTrainer: true,
                        trainerPokemons: e.detail.pokemons,
                        currentTrainerPokeIndex: 0
                    })
                    await this.battle.init()
                })
            }, 500)
        })

        //termine le combat
        window.addEventListener("endBattle", async () => {
            console.log("endBattle", this.currentTrainerId, this.currentBadgeId)
            if (this.battle) this.battle.destroy()
            if (this.currentTrainerId) {
                await fetch(`http://localhost:3000/api/trainers/${this.currentTrainerId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ defeated: true })
                })

                await fetch("http://localhost:3000/api/wallet", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount: 500 })
                })

                if (this.currentBadgeId) {
                    await fetch("http://localhost:3000/api/badges", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ badgeId: this.currentBadgeId })
                    })
                    this.currentBadgeId = null
                }

                this.currentTrainerId = null
            }
            this.battle = null
            this.player.inBattle = false
            this.audio.play("map")
        })

        //soigne l'équipe
        window.addEventListener("healTeam", async () => {
            const response = await fetch("http://localhost:3000/api/team")
            const team = await response.json()
            for (const poke of team) {
                await fetch(`http://localhost:3000/api/team/${poke._id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ currentHP: poke.maxHP })
                })
            }
        })

        //ouvre la page shop
        window.addEventListener("openShop", async () => {
            await this.inventory.fetchWallet()
            await this.inventory.fetchInventory()
            this.inventory.showShop = true
            this.inventory.canvas.style.pointerEvents = "all"
            this.player.inventoryOpen = true
        })

        
        window.addEventListener("starterChosen", async (e) => {


            //récupère le starter choisi
            const capitalize = name => name.charAt(0).toUpperCase() + name.slice(1)
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${e.detail.name.toLowerCase()}`)
            const data = await response.json()
            //stats et moove du pokemon

            const moves = data.moves.slice(0, 4).map(m => m.move.name)
            const baseHP = data.stats.find(s => s.stat.name === "hp").base_stat
            const maxHP = Math.floor((2 * baseHP * 5) / 100) + 5 + 10

            //le mets dans la team
            await fetch("http://localhost:3000/api/team", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pokemon:  capitalize(data.name), id: data.id, niveau: 5, moves, xp: 0, currentHP: maxHP, maxHP })
            })

            //rajoute le starter dans le pokedex
            await fetch("http://localhost:3000/api/pokedex", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pokemonId: data.id, pokemon: e.detail.pokemon })
            })

            //considère comem starter (permet de ne pas en prendre un autre)
            await fetch("http://localhost:3000/api/starter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chosen: true })
            })
        })

        //ouvre le pc
        window.addEventListener("openPC", async () => {
            await this.inventory.fetchTeam()
            await this.inventory.fetchPC()
            this.inventory.showPC = true
            this.inventory.canvas.style.pointerEvents = "all"
            this.player.inventoryOpen = true
        })

        //sauvegarde
        window.addEventListener("saveGame", async () => {
            await fetch("http://localhost:3000/api/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    x: this.player.renderX,
                    y: this.player.renderY,
                    map: this.currentMap,
                    direction: this.player.direction,
                    volume: this.audio.volume
                })
            })
        })

        //modifier le volume
        window.addEventListener("volumeChange", (e) => {
            this.audio.setVolume(e.detail.volume)
        })

        //joueur a plus de poké en vie
        window.addEventListener("playerDefeated", () => {
            window.location.reload()
        })

        this.gameLoop()
    }
}
const game =new GameView();
game.init();
