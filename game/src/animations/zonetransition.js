export default
class zonetransition {
    constructor(){
        this.zonename = null;
        this.active = false;
        this.opacity = 0;
        this.phase = "in"
        this.timer = 0
    }
    show(zonename) {
        console.log("showw");
        this.active = true;
        this.opacity = 0;
        this.phase = "in"
        this.zonename = zonename
    }
    update() {
        if (!this.active) return
        if (this.phase === "in") {
            this.opacity+=0.1;
            if (this.opacity>=1) {
                this.phase = "stay";
            }
        }
        if (this.phase === "stay") {
            this.timer++;
            if (this.timer >=150) {
                this.phase = "out";
                this.timer = 0;
            }
        }
        if (this.phase === "out") {
            this.opacity-=0.1;
            if (this.opacity<=0) {
                this.active = false;
            }
        }
    }
    draw(ctx, canvas) {
        if (!this.active) return
        ctx.globalAlpha = this.opacity;
        ctx.beginPath()
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
        ctx.roundRect(16, 30, 300, 80, 4)
        ctx.fill()

        ctx.fillStyle = "white"
        ctx.font = "bold 24px monospace"
        ctx.textAlign = "center"
        ctx.fillText(this.zonename, 16 + 300/2, 30 + 80/2 + 8)
        ctx.textAlign = "left"

        ctx.globalAlpha = 1
    }
}