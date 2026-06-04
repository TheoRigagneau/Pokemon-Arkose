class Assets {
    constructor() {
        this.images = {}
    }

    async load(name, path) {
        const img = new Image()
        img.src = path
        await new Promise(resolve => img.onload = resolve)
        this.images[name] = img
    }

    get(name) {
        return this.images[name]
    }
}

export default Assets