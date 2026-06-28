export default function Hero({ onAuthClick, user }) {

  let boutonTelechargement
  if (user) {

    boutonTelechargement = (
      <a href="/PokemonArkose.zip" download>
        <button className="mt-8 bg-[#c8900a] text-[#0d0a05] font-bold px-8 py-3 rounded hover:bg-[#e0a010]">
          Télécharger le jeu
        </button>
      </a>
    )
  } else {
    boutonTelechargement = (
      <button onClick={onAuthClick} className="mt-8 bg-[#c8900a] text-[#0d0a05] font-bold px-8 py-3 rounded hover:bg-[#e0a010]">
        Télécharger le jeu
      </button>
    )
  }

  return (
    //suite de la page principale
    <section className="bg-[#fffdf7] text-center py-16">
      <p className="text-[#b89040] tracking-[5px] text-sm mb-4">· ORIGINE · TEMPS · ESPACE ·</p>
      <h1 className="text-[#1a1005] font-bold text-6xl tracking-widest">POKEMON</h1>
      <h2 className="text-[#c8900a] font-bold text-6xl tracking-widest">ARKOSE</h2>
      <p className="text-[#5a4a20] mt-6 max-w-xl mx-auto text-sm">
        Un fan-game Pokémon jouable dans le navigateur
      </p>

      {boutonTelechargement}
    </section>
  )
}
