const directions = {
    north: 1,
    east: 0,
    south: 3,
    west: 2
}
export default
class Player {
    constructor(id, name, skinPath, position, map, dialogBox, transition ,zonetransition) {
        this.id = id;
        this.name = name;
        this.map = map;

        this.skinPath = skinPath;
        console.log("skin :",this.skinPath);

        this.renderX = position[0];
        this.renderY = position[1];

        this.direction = directions.south;
        this.isWalking = false;

        this.walkSpriteIndex = 0;
        this.walkSpritesNumber = 9;
        this.currentWalkSpriteStep = 0;
        this.walkSpriteDuration = 16;

        this.dialogBox = dialogBox;
        this.inZone = false;
        this.inGrass = false;
        this.lastGrassTileX = null;
        this.lastGrassTileY = null;
        this.transition = transition
        this.zonetransition = zonetransition;
        this.LastDirection = this.direction

        this.targetX = this.renderX;
        this.targetY = this.renderY;
        this.inBattle = false

        this.inputState = { up: false, down: false, left: false, right: false, interact: false, run: false }



        window.addEventListener("keydown", (event) => {
            switch (event.key.toLowerCase()) {
                case "z"    : this.inputState.up = true; break;
                case "s"    : this.inputState.down = true; break;
                case "q"    : this.inputState.left = true; break;
                case "d"    : this.inputState.right = true; break;
                case "shift": this.inputState.run = true; break;
                case " ":
                    if (!this.inputState.interact) {

                        if (this.dialogBox.isOpen) {
                            this.dialogBox.next();
                        } else {
                            this.interact();
                        }

                    }

                    this.inputState.interact = true;
                    break;
            }
        });

        window.addEventListener("keyup", (event) => {
            switch (event.key.toLowerCase()) {
                case "z": this.inputState.up = false; break;
                case "s": this.inputState.down = false; break;
                case "q": this.inputState.left = false; break;
                case "d": this.inputState.right = false; break;
                case "shift": this.inputState.run = false; break;
                case " ": this.inputState.interact = false; break;
            }
        });

    }
    isColliding(x, y) {
        const tileX = Math.floor(x / this.map.tilewidth)
        const tileY = Math.floor(y / this.map.tileheight)
        const tileIndex = tileY * this.map.width + tileX

        for (const layer of this.map.layers) {
            if (layer.type === "tilelayer") {
                const hasCollision = layer.properties?.find(p => p.name === "collision" && p.value === true)
                if (hasCollision && layer.data[tileIndex] !== 0) {
                    return true
                }
            }
        }
        
        return false
    }
    isOnGrass(x, y) {
        const tileX = Math.floor(x / this.map.tilewidth)
        const tileY = Math.floor(y / this.map.tileheight)
        const tileIndex = tileY * this.map.width + tileX

        for (const layer of this.map.layers) {
            if (layer.name === "herbe" && layer.data[tileIndex] !== 0) {
                return true
            }
        }
        
        return false
    }
    interact() {
        let checkX = this.renderX
        let checkY = this.renderY

        if (this.direction === directions.north) checkY -= this.map.tileheight
        else if (this.direction === directions.south) checkY += this.map.tileheight
        else if (this.direction === directions.west) checkX -= this.map.tilewidth
        else if (this.direction === directions.east) checkX += this.map.tilewidth

        for (const layer of this.map.layers) {
            if (layer.name === "interactions") {
                for (const obj of layer.objects) {
                    if (checkX >= obj.x && checkX < obj.x + obj.width &&
                        checkY >= obj.y && checkY < obj.y + obj.height) {
                        const info = Object.fromEntries(obj.properties.map(p => [p.name, p.value]))
                        if (info.type === "porte") {
                            this.dialogBox.isOpen = false
                            window.dispatchEvent(new CustomEvent("changeMap", {
                                detail: {
                                    destination: info.destination,
                                    spawnX: info.spawnX,
                                    spawnY: info.spawnY
                                }
                                
                            }))
                        }
                        else if (info.type === "pancarte" || "eau" ||"statue") {
                            this.dialogBox.show(info.dialogue)
                        }
                        return
                    }
                }
            }

            if (layer.name === "PNJ") {
                for (const obj of layer.objects) {

                    const info = Object.fromEntries(
                        obj.properties.map(p => [p.name, p.value])
                    );

                    if (
                        checkX >= obj.x - 16 &&
                        checkX < obj.x + obj.width + 16 &&
                        checkY >= obj.y - 16 &&
                        checkY < obj.y + obj.height + 16
                    ) {
                        this.dialogBox.show(info.dialogue);

                        return;
                    }
                }
            }
        }
    }

    checkZones() {
        let FoundInZone = false
        for (const layer of this.map.layers) {
            if (layer.name === "transition") {
                for (const obj of layer.objects) {
                    if (this.renderX >= obj.x && this.renderX < obj.x + obj.width &&
                        this.renderY >= obj.y && this.renderY < obj.y + obj.height) {
                        const info = Object.fromEntries(obj.properties.map(p => [p.name, p.value]))
                        if (this.direction === directions.west ) {
                            FoundInZone = true;
                            if (this.inZone === false) {
                                this.dialogBox.isOpen = false
                                this.zonetransition.show(info.ZL)
                                this.inZone = true;
                            }
                        }
                        if (this.direction === directions.east) {
                            FoundInZone = true
                            if (this.inZone === false) {
                                this.dialogBox.isOpen = false
                                this.zonetransition.show(info.ZR)
                                this.inZone = true;
                            }
                        }
                        if (this.direction === directions.north) {
                            FoundInZone = true
                            if (this.inZone === false) {
                                this.dialogBox.isOpen = false
                                this.zonetransition.show(info.ZU)
                                this.inZone = true;
                            }
                        }
                        if (this.direction === directions.south) {
                            FoundInZone = true
                            if (this.inZone === false) {
                                this.dialogBox.isOpen = false
                                this.zonetransition.show(info.ZD)
                                this.inZone = true;
                            }
                        }
                    }
                }
            }
        }
        if (!FoundInZone) this.inZone = false
        if (this.LastDirection !== this.direction) {
            this.inZone = false
        }
        this.LastDirection = this.direction
    }
    async Encounter(currentTileX, currentTileY) {
        window.dispatchEvent(new CustomEvent("grassStep", {
                detail: {
                    tileX: Math.floor(this.renderX / 32),
                    tileY: Math.floor(this.renderY / 32)
            }}))
        this.inGrass = true
        this.lastGrassTileX = currentTileX
        this.lastGrassTileY = currentTileY
        let encounters = Math.floor(Math.random()*7);
        if (encounters == 5) {
            for (const layer of this.map.layers) {
                if (layer.name === "localisation") {
                    for (const obj of layer.objects) {
                        if (this.renderX >= obj.x && this.renderX < obj.x + obj.width &&
                            this.renderY >= obj.y && this.renderY < obj.y + obj.height) {
                            const info = Object.fromEntries(obj.properties.map(p => [p.name, p.value]))
                            const response = await fetch(`http://localhost:3000/api/encounters/${info.route}`)
                            const encounters_route = await response.json()
                            let random_spawn = Math.floor(Math.random()*100)
                            let poke = 0
                            console.log(info.route, encounters)
                            while ( random_spawn > 0  && poke < encounters_route.length) {   
                                random_spawn -= encounters_route[poke].chance
                                poke+=1
                            }
                            const poke_encounter = encounters_route[(poke-1)].pokemon;
                            const niveau = Math.floor(Math.random() * (encounters_route[poke-1].niveauMax - encounters_route[poke-1].niveauMin + 1)) + encounters_route[poke-1].niveauMin;
                            
                            window.dispatchEvent(new CustomEvent("startbattle", {
                                detail: {
                                    pokemon: poke_encounter,
                                    id: encounters_route[poke-1].id,
                                    niveau: niveau
                                }
                            }))
                        }
                    }
                }
            }
        }
    }

    async move() {
        if (this.dialogBox.isOpen || this.inBattle) return
        const speed = this.inputState.run ? 4 : 2
        if (this.isMoving) {
            const dx = this.targetX - this.renderX
            const dy = this.targetY - this.renderY

            if (Math.abs(dx) <= speed && Math.abs(dy) <= speed) {
                this.renderX = this.targetX
                this.renderY = this.targetY
                this.isMoving = false
            } else {
            this.renderX += Math.sign(dx) * speed
            this.renderY += Math.sign(dy) * speed
            }
        }
        const currentTileX = Math.floor(this.renderX / 32)
        const currentTileY = Math.floor(this.renderY / 32)
        

        if (this.isOnGrass(this.renderX, this.renderY)) {
            if (!this.inGrass || currentTileX !== this.lastGrassTileX || currentTileY !== this.lastGrassTileY) {
               const pokemon_encounter = this.Encounter(currentTileX, currentTileY)
               
            }
            

        }
        else {
                this.inGrass = false
        }

        if (!this.isMoving) {
            if (this.inputState.up) {
                this.direction = directions.north;
                this.targetX = this.renderX
                this.targetY = this.renderY - 32
                if (!this.isColliding(this.renderX, this.renderY -32)) {
                    this.isMoving = true
                    this.isWalking = true
                }
            }
            else if (this.inputState.down) {
                this.direction = directions.south;
                this.targetX = this.renderX
                this.targetY = this.renderY + 32
                if (!this.isColliding(this.renderX, this.renderY + 32)) {
                    this.isMoving = true
                    this.isWalking = true
                }
            }
            else if (this.inputState.left) {
                this.direction = directions.west;
                this.targetX = this.renderX - 32
                this.targetY = this.renderY
                if (!this.isColliding(this.renderX - 32, this.renderY )) {
                    this.isMoving = true
                    this.isWalking = true
                }
            }
            else if (this.inputState.right) {
                this.direction = directions.east;
                this.targetX = this.renderX + 32
                this.targetY = this.renderY
                if (!this.isColliding(this.renderX + 32, this.renderY )) {
                    this.isMoving = true
                    this.isWalking = true
                }
            }
            else {
                this.isWalking = false;
            }
        }
        this.checkZones()
    }
    

    animate() {
        if (this.isMoving) {

            this.currentWalkSpriteStep++;
            if (this.currentWalkSpriteStep >= this.walkSpriteDuration) {
                this.currentWalkSpriteStep = 0;
                this.walkSpriteIndex++;
            }
            if (this.walkSpriteIndex >= this.walkSpritesNumber) {
                this.walkSpriteIndex = 0;
            }
        }
        
    }
    draw(ctx, walkSprite, runSprite) {
        const spriteImage = this.inputState.run ? runSprite : walkSprite
        const directionRow = [2, 3, 1, 0][this.direction]
        const col = !this.isMoving ? 0 :
            this.inputState.run ? (this.walkSpriteIndex % 3) + 1 :
            this.walkSpriteIndex % 4
        
        const sx = col * 64
        const sy = directionRow * 64
        
        ctx.drawImage(
            spriteImage,
            sx, sy, 64, 64,
            this.renderX - 32, this.renderY - 32, 64, 64
        )
    }
}