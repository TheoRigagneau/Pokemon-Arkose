export default function News() {
  //rectangle dans lequel on voit les nouveautés lié au jeu
  const articles = [
    {
      date: "07 Mai 2026",
      title: "Lancement de la Beta",
      description: "La première version jouable de Pokémon Arkose est disponible ! Explorez Boscalis et partez à l'aventure."
    },
    {
      date: "15 Avril 2026", 
      title: "Système de combat",
      description: "Le système de combat tour par tour est maintenant implémenté avec les vraies stats des Pokémon."
    },
    {
      date: "01 Mars 2026",
      title: "Début du projet",
      description: "Pokémon Arkose est officiellement lancé ! Une nouvelle aventure fan-made vous attend."
    }
  ]

  return (
    <section className="bg-[#fffdf7] py-12 px-6">
      <h2 className="text-center text-[#1a1005] font-bold text-2xl tracking-widest mb-2">
        DERNIÈRES NOUVELLES
      </h2>
      <div className="w-16 h-0.5 bg-[#c8900a] mx-auto mb-8" />
      
      <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6">
        {articles.map((article, i) => (
          <div key={i} className="border border-[#e0cc88] rounded bg-[#fdf8ec] p-6">
            <p className="text-[#c8900a] text-xs tracking-widest mb-2">{article.date}</p>
            <h3 className="text-[#1a1005] font-bold text-sm mb-3 tracking-wide">{article.title}</h3>
            <p className="text-[#5a4a20] text-xs leading-relaxed">{article.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}