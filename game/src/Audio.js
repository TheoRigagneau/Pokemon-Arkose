export default class AudioGame {
    constructor() {
        this.tracks = {}
        this.current = null
        this.volume = 0.5
    }

    load(key, path) {
        const audio = new window.Audio(path)
        audio.loop = true
        audio.volume = this.volume
        this.tracks[key] = audio
    }

    play(key) {
        console.log("play:", key, "track:", this.tracks[key])
        if (this.current === key) return
        this.stop()
        this.current = key
        const track = this.tracks[key]
        if (track) {
            track.currentTime = 0
            const promise = track.play()
            if (promise !== undefined) {
                promise.catch(() => {})
            }
        }
    }

    stop() {
        if (this.current && this.tracks[this.current]) {
            this.tracks[this.current].pause()
            this.tracks[this.current].currentTime = 0
        }
        this.current = null
    }

    setVolume(v) {
        this.volume = v
        for (const track of Object.values(this.tracks)) {
            track.volume = v
        }
    }
}