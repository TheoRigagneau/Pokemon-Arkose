export default
class Transition {
    constructor() {
        this.active = false;
        this.opacity = 0;
        this.phase = "in"
        this.callback = null
    }
    start(callback) {
        this.active = true;
        this.phase = "in";
        this.opacity = 0;
        this.callback = callback;
    }
    update() {
        if (!this.active) return
        if (this.phase === "in") {
            this.opacity+=0.05;
            if (this.opacity >=1) {
                this.callback();
                this.phase= "out";
            }
        }
        if (this.phase === "out") {
            this.opacity-=0.05;
            if (this.opacity<=0) {
                this.active = false;
            }
        }
    }
    draw(ctx, canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        if (!this.active) return
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
    }

}
