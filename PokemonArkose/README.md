# 🎮 Pokémon Arkose

> ⚠️ **Version bêta** — le jeu est encore en cours de développement, de nombreuses fonctionnalités sont à venir.

> Un site web dédié est en cours de développement — il permettra d'obtenir plus d'informations sur le jeu ainsi que de le télécharger.

Pokémon Arkose est un jeu de rôle Pokémon fan-made développé en JavaScript natif avec HTML5 Canvas. Partez à l'aventure dans la région de Boscalis, capturez des Pokémon, affrontez des dresseurs et construisez votre équipe.

---

## Fonctionnalités

- 🗺️ Exploration libre avec interactions (PNJ, objets, portes)
- ⚔️ Combats sauvages et contre des dresseurs
- 🎒 Inventaire complet (équipe, sac, Pokédex, PC, shop...)
- 🏥 Centre Pokémon pour soigner votre équipe
- 🎵 Musiques et effets sonores
- 💾 Sauvegarde de la progression

---

## Installation

### Prérequis

- Node.js
- MongoDB
- Live Server (VS Code)

### Configuration

Crée un fichier `.env` dans le dossier `server/` :

MONGODB_URI=ta_chaine_de_connexion_mongodb

Tu peux créer une base MongoDB gratuite sur [MongoDB Atlas](https://www.mongodb.com/atlas).

### Lancement

```bash
npm install
node server/server.js
node server/seed.js
node server/seedInventory.js
```

Ouvrir `game/game.html` avec Live Server.

> ⚠️ Le fichier `.vscode/settings.json` doit contenir `"liveServer.settings.root": "/"`.

---

## Crédits

- Données Pokémon : [PokéAPI](https://pokeapi.co)
- Musiques : Nintendo / Game Freak
- Tilesets : ressources fan-made communauté Pokémon
