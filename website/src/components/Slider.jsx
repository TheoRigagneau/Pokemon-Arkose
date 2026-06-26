import { useState } from "react"

export default function Slider() {
  const [current, setCurrent] = useState(0)
  
  const images = [
    { src: "/screenshots/screen1.png", alt: "Screenshot 1" },
    { src: "/screenshots/screen2.png", alt: "Screenshot 2" },
    { src: "/screenshots/screen3.png", alt: "Screenshot 3" },
  ]

  const prev = () => setCurrent((current - 1 + images.length) % images.length)
  const next = () => setCurrent((current + 1) % images.length)

  return (
    <section className="bg-[#fffdf7] py-12 px-6">
      <h2 className="text-center text-[#1a1005] font-bold text-2xl tracking-widest mb-8">
        APERÇU DU JEU
      </h2>

      <div className="relative max-w-3xl mx-auto">
        <img 
          src={images[current].src} 
          alt={images[current].alt}
          className="w-full h-96 object-cover rounded border border-[#c8900a]"
        />

        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 bg-[#3a2a10] border border-[#c8900a] text-[#e8c060] px-3 py-2 rounded hover:bg-[#5a4010]"
        >
          ←
        </button>

        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 bg-[#3a2a10] border border-[#c8900a] text-[#e8c060] px-3 py-2 rounded hover:bg-[#5a4010]"
        >
          →
        </button>

        <div className="flex justify-center gap-2 mt-4">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full ${i === current ? "bg-[#c8900a]" : "bg-[#d8c090]"}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
