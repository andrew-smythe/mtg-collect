# mtg-collect

## How it Works

***mtg-collect*** is a front-end only application for searching and deck-building tool for Magic: the Gathering cards. Users can search for cards by name in the **Individual Card Search** mode and add them to their decks. Users can then view their decks in the **Deck Builder** mode, where they can adjust the quantity of cards, or remove cards from their deck. Deck lists are saved to local storage.

#### Relevant Deck Building Restrictions

In Magic, decks may only contain up to 4 copies of a single card (except for Basic Land cards). There are a few exceptions to this, but ***mtg-collect*** does not take this into account.

#### Scryfall API 

***mtg-collect*** utilizes [Scryfall.com's public API](https://scryfall.com/docs/api) for card searching, and for populating card data. Because ***mtg-collect*** is a front-end only application, there are some limitations to how it uses the API. Scryfall's API imposes limits on how often queries can be performed (see https://scryfall.com/docs/api#rate-limits-and-good-citizenship). To ensure that this is not violated, the search tool in ***mtg-collect*** will only return the first 175 cards of each search. There are 21,149 possible cards that could be searched for. A search that would return a large number of these would take quite some time to populate at 1750 cards per second.

***mtg-collect*** only allows for searching of *"normal layout"* Magic cards. This means that split cards and double face cards, like [Huntmaster of the Fells](https://scryfall.com/card/dka/140/huntmaster-of-the-fells-ravager-of-the-fells), or [Turn // Burn](https://scryfall.com/card/dgm/134/turn-burn) are not searchable.

## Setting up mtg-collect

### Compiles and hot-reloads for development
```
npm install
npm run serve
```

### Compiles and minifies for production
```
npm install
npm run build
```

### First Run

If there have been no saves to local storage when ***mtg-collect*** is loaded, 2 decks are automatically loaded into the Deck Builder view from a JSON file. After that, whatever changes are made will be maintained with local storage.
