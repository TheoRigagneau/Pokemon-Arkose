import Player from "./Player.js";
import Assets from "./Assets.js";
import DialogBox from "./DialogBox.js"
import Transition from "./animations/Transition.js"
import zoneTransition from "./animations/zonetransition.js"

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
                                const source = tilesetInfo.source
                                if (source.includes("house")) {
                                    tileset = this.assets.get("house")
                                    localTileId = tileId - tilesetInfo.firstgid + 1
                                } else if (source.includes("grass")) {
                                    tileset = this.assets.get("herbe")
                                    tilesetColumns = tileset.width / 16
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
                const startTileX = Math.max(0,Math.floor((this.player.renderX - this.canvas.width / 2) / this.map.tilewidth));
                const endTileX = Math.min(this.map.width,Math.ceil((this.player.renderX + this.canvas.width / 2) / this.map.tilewidth));
                const startTileY = Math.max(0,Math.floor((this.player.renderY - this.canvas.height / 2) / this.map.tileheight));
                const endTileY = Math.min(this.map.height, Math.ceil((this.player.renderY + this.canvas.height / 2) / this.map.tileheight));
                
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
                                if (source.includes("house")) {
                                    tileset = this.assets.get("house")
                                    localTileId = tileId - tilesetInfo.firstgid + 1
                                } else if (source.includes("grass")) {
                                    tileset = this.assets.get("herbe")
                                    tilesetColumns = tileset.width / 16
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
                const spriteKey = obj.properties?.find(p => p.name === "sprite")?.value
                const sprite = this.assets.get(spriteKey)
                if (sprite) {
                    this.ctx.drawImage(sprite, 0, 0, 64, 64, obj.x - 32, obj.y - 32, 64, 64)
                }
            }
        }
    }
}
    gameLoop() {
        console.log(this.player.renderX, this.player.renderY)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

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
        this.player.draw(this.ctx, this.playerWalkSprite, this.playerRunSprite);

        this.ctx.restore();
        this.dialogBox.draw();
        console.log(this.uiCanvas)
        this.transition.update();
        this.transition.draw(this.uiCtx, this.uiCanvas)
        this.zoneTransition.update();
        this.zoneTransition.draw(this.uiCtx,this.transitionCanvas);

        requestAnimationFrame(() => this.gameLoop());
    }

    async init() {
        window.game = game;
        await this.loadMap("./game/assets/maps/Boscalis.json")

        this.assets = new Assets()
        await this.assets.load("tileset", "./game/assets/tilesets/sprites.png");
        await this.assets.load("house", "./game/assets/tilesets/house.png");
        await this.assets.load("herbe", "./game/assets/tilesets/grass.png");
        await this.assets.load("playerWalk", "./game/assets/tilesets/png/npc_198_Lucas.png");
        await this.assets.load("playerRun", "./game/assets/tilesets/png/npc_198_Lucas_run.png");
        await this.assets.load("npc_1", "./game/assets/tilesets/png/NPC_001_Ace_Trainer_M.png") ;
        await this.assets.load("npc_3", "./game/assets/tilesets/png/NPC_049_Collector.png") ;

        this.tileset = this.assets.get("tileset");

        this.offscreenBottom = this.buildOffscreenCanvas(["Maison", "Arbre 1", "Arbre2", "eau", "Ombre", "Pancarte", "collisions", "fleur", "fleur2"])
        this.offscreenTop = this.buildOffscreenCanvas(["Sol", "fleur", "fleur2"])

        this.playerWalkSprite = this.assets.get("playerWalk");
        this.playerRunSprite = this.assets.get("playerRun");
        this.dialogBox = new DialogBox();
        this.zoneTransition = new zoneTransition();
        this.player = new Player(1, "Joueur", "./game/assets/tilesets/png/npc_198_Lucas.png", [326, 689], this.map, this.dialogBox, this.zoneTransition);
        this.transition = new Transition();

        window.addEventListener("changeMap", async (e) => {
            this.transition.start(async () => {
                await this.loadMap(`./game/assets/maps/${e.detail.destination}.json`)
                this.offscreenBottom = this.buildOffscreenCanvas(["Maison", "Arbre 1", "Arbre2", "eau", "Ombre", "Pancarte", "collisions", "fleur", "fleur2"])
                this.offscreenTop = this.buildOffscreenCanvas(["Sol", "fleur", "fleur2"]);
                this.player.map = this.map
                this.player.renderX = e.detail.spawnX
                this.player.renderY = e.detail.spawnY
            })
        })
        this.gameLoop()

        
    }
}
const game =new GameView();
game.init();
