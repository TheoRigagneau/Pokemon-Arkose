export const ShopMixin = {

    async fetchWallet() {
        const res = await fetch("http://localhost:3000/api/wallet")
        const data = await res.json()
        this.walletAmount = data.amount
    },

    drawShop() {
        const ctx = this.ctx
        const w = this.canvas.width
        const h = this.canvas.height

        ctx.fillStyle = "#f0ede0"
        ctx.fillRect(0, 0, w, h)

        ctx.fillStyle = "#2a2a2a"
        ctx.font = "bold 14px 'Press Start 2P'"
        ctx.textAlign = "center"
        ctx.fillText("SHOP", w / 2, 40)

        const back = this.assets.get("back")
        if (back) ctx.drawImage(back, w - 80, 10, 60, 50)

        ctx.fillStyle = "#c8a820"
        ctx.font = "bold 11px 'Press Start 2P'"
        ctx.textAlign = "right"
        ctx.fillText(`₽ ${this.walletAmount ?? "..."}`, w - 100, 40)
        ctx.textAlign = "left"

        //items achetable
        const items = [
            { name: "Potion",   price: 300,  description: "Restaure 20 PV" },
            { name: "Pokéball", price: 200,  description: "Capture un Pokémon" },
        ]
        //regarde la quantité de chaque item dans l'inventaire du joueur
        items.forEach((item, i) => {
             const inv = this.inventoryData.find(inv => inv.itemName === item.name)
            const quantity = inv?.quantity ?? 0

            const x = w * 0.1
            const y = h * 0.2 + i * h * 0.16

            ctx.fillStyle = "#ffffff"
            ctx.beginPath()
            ctx.roundRect(x, y, w * 0.8, h * 0.12, 10)
            ctx.fill()
            ctx.strokeStyle = "#c8a820"
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.roundRect(x, y, w * 0.8, h * 0.12, 10)
            ctx.stroke()

            ctx.fillStyle = "#2a2a2a"
            ctx.font = "bold 11px 'Press Start 2P'"
            ctx.textAlign = "left"
            ctx.fillText(item.name, x + 16, y + h * 0.05)

            ctx.font = "9px 'Press Start 2P'"
            ctx.fillStyle = "#666"
            ctx.fillText(`x${quantity}`, x + 16, y + h * 0.085)

            ctx.fillStyle = "#c8a820"
            ctx.font = "bold 11px 'Press Start 2P'"
            ctx.textAlign = "right"
            ctx.fillText(`₽ ${item.price}`, x + w * 0.8 - 16, y + h * 0.065)
            ctx.textAlign = "left"
        })
    },

    async buyItem(itemName, price) {
        if ((this.walletAmount ?? 0) < price) return

        //mets a jour le portemonnaie du joueur
        await fetch("http://localhost:3000/api/wallet", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: -price })
        })
        
        //ajoute de 1 l'objet acheté
        await fetch("http://localhost:3000/api/inventory", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itemName, quantity: 1 })
        })

        this.walletAmount -= price
    }
}