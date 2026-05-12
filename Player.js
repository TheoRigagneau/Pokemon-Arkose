const directions = {
    north: 1,
    east: 0,
    south: 3,
    west: 2
}
export default
class Player {
    constructor(id, name, skinPath, position, map) {
        this.id = id;
        this.name = name;
        this.map = map;

        this.skinPath = skinPath;
        console.log("skin :",this.skinPath);

        this.renderX = position[0];
        this.renderY = position[1];

        this.new_x = position[0];
        this.new_y = position[1];

        this.last_x = this.new_x;
        this.last_y = this.new_y;

        this.direction = directions.south;
        this.isWalking = false;

        this.walkSpriteIndex = 0;
        this.walkSpritesNumber = 9;
        this.currentWalkSpriteStep = 0;
        this.walkSpriteDuration = 8;

        this.inputState = { up: false, down: false, left: false, right: false, interact: false, run: false }



        window.addEventListener("keydown", (event) => {
            switch (event.key.toLowerCase()) {
                case "z"    : this.inputState.up = true; break;
                case "s"    : this.inputState.down = true; break;
                case "q"    : this.inputState.left = true; break;
                case "d"    : this.inputState.right = true; break;
                case "shift": this.inputState.run = true; break;
                case " "    :
                    if (!this.inputState.interact) {
                        this.interact()
                    }
                    this.inputState.interact = true
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
        
        for (const layer of this.map.layers) {
            if (layer.name === "PNJ") {
                for (const obj of layer.objects) {
                    if (x >= obj.x && x < obj.x + obj.width &&
                        y >= obj.y && y < obj.y + obj.height) {
                        return true
                    }
                }
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
                    console.log("Interaction !", obj.properties)
                    return
                }
            }
        }
    }
    for (const layer of this.map.layers) {
        if (layer.name === "PNJ") {
            for (const obj of layer.objects) {
                if (checkX >= obj.x && checkX < obj.x + obj.width &&
                    checkY >= obj.y && checkY < obj.y + obj.height) {
                    console.log("PNJ !", obj.properties)
                    return
                }
            }
        }
    }
}

    move() {
        const speed = this.inputState.run ? 4 : 2;

        if (this.inputState.up) {
            this.direction = directions.north;
            if (!this.isColliding(this.renderX, this.renderY - speed)) {
                this.renderY -= speed;
                this.direction = directions.north;
                this.isWalking = true;
            } else {
                this.isWalking = false;
            }
        } 

        else if (this.inputState.down) {
            this.direction = directions.south;
            if (!this.isColliding(this.renderX, this.renderY + speed)) {
            this.renderY += speed;
            this.direction = directions.south;
            this.isWalking = true;
            } else {
                this.isWalking = false;
            }
        } 
        
        else if (this.inputState.left) {
            this.direction = directions.west;
            if (!this.isColliding(this.renderX - speed, this.renderY)) {
            this.renderX -= speed;
            this.direction = directions.west;
            this.isWalking = true;
            } else {
                this.isWalking = false;
            }
        } 
        
        else if (this.inputState.right) {
            this.direction = directions.east;
            if (!this.isColliding(this.renderX + speed, this.renderY)) {
            this.renderX += speed;
            this.direction = directions.east;
            this.isWalking = true;
            } else {
                this.isWalking = false;
            }
        } 
        
        else {
            this.isWalking = false;
        }     
    }

    animate() {

        if (this.isWalking) {

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
        const col = !this.isWalking ? 0 :
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
