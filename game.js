import Player from "./Player.js";
import Assets from "./Assets.js";
import DialogBox from "./DialogBox.js"

class GameView {
    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");
    }
    async loadMap(path) {
        const ville1 = await fetch(path);
        const Boscalis =await ville1.json();
        this.map = Boscalis;
    }
    async drawMap() {
        for (const layer of this.map.layers) {
            if (layer.type === "tilelayer") {
                layer.data.forEach((tileId, i) => {
            if (tileId !== 0) {
                const column = i % this.map.width;
                const line = Math.floor(i / this.map.width);
                const x = column * this.map.tilewidth;
                const y = line * this.map.tileheight;

                let tileset = this.tileset
                let tilesetColumns = 16
                let localTileId = tileId

                const tilesetInfo = [...this.map.tilesets].reverse().find(ts => tileId >= ts.firstgid)
                const isHouse = tilesetInfo?.source?.includes("house")
                if (isHouse) {
                    tileset = this.assets.get("house")
                    localTileId = tileId - tilesetInfo.firstgid + 1
}

                const tilesetX = ((localTileId - 1) % tilesetColumns) * 16
                const tilesetY = Math.floor((localTileId - 1) / tilesetColumns) * 16
                
                this.ctx.drawImage(tileset, tilesetX, tilesetY, 16, 16, x, y, this.map.tilewidth, this.map.tileheight)

                    }
                })
            }
        }
    }
    async drawNPCs() {
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
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        const camX = this.canvas.width / 2 - this.player.renderX
        const camY = this.canvas.height / 2 - this.player.renderY
        
        this.ctx.save()
        this.ctx.translate(camX, camY)
        
        this.drawMap();
        this.drawNPCs();
            
        this.player.move();
        this.player.animate();
        this.player.draw(this.ctx, this.playerWalkSprite, this.playerRunSprite);
        
        this.ctx.restore();
        this.dialogBox.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    async init() {
        window.game = game;
        await this.loadMap("./game/assets/maps/Boscalis.json");

        this.assets = new Assets()
        await this.assets.load("tileset", "./game/assets/tilesets/sprites.png");
        await this.assets.load("house", "./game/assets/tilesets/house.png");
        await this.assets.load("herbe", "./game/assets/tilesets/grass.png");
        await this.assets.load("playerWalk", "./game/assets/tilesets/png/npc_198_Lucas.png");
        await this.assets.load("playerRun", "./game/assets/tilesets/png/npc_198_Lucas_run.png");
        await this.assets.load("npc_1", "./game/assets/tilesets/png/NPC_001_Ace_Trainer_M.png") ;
        await this.assets.load("npc_3", "./game/assets/tilesets/png/NPC_049_Collector.png") ;

        this.tileset = this.assets.get("tileset");
        this.playerWalkSprite = this.assets.get("playerWalk");
        this.playerRunSprite = this.assets.get("playerRun");
        this.dialogBox = new DialogBox();
        this.player = new Player(1, "Joueur", "./game/assets/tilesets/png/npc_198_Lucas.png", [100, 100], this.map, this.dialogBox);

        window.addEventListener("changeMap", async (e) => {
            await this.loadMap(`./game/assets/maps/${e.detail.destination}.json`)
            this.player.map = this.map
            this.player.renderX = e.detail.spawnX
            this.player.renderY = e.detail.spawnY
        })

        this.gameLoop()

        
    }
}
const game =new GameView();
game.init();
