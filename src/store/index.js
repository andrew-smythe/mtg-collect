import Vue from "vue";
import Vuex from "vuex";
import deckData from "../assets/decks.json";

const axios = require('axios');

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        searchTerm: '',
        resultCards: [],
        loadingSearch: false,
        scryfallApi: 'https://api.scryfall.com/',
        baseSearchParams: 'order=name&q=layout%3Anormal',
        noCardsFound: false,
        symbology: [],
        decks: deckData,
        clearResultsOnNewSearch: true,
    },
    getters: {},
    mutations: {
        updateSearchTerm (state, val) {
            state.searchTerm = val;
        },
        updateLoadingSearch (state, val) {
            state.loadingSearch = val;
        },
        updateCardResults (state, newCards) {
            if (!!state.clearResultsOnNewSearch) {
                state.resultCards = newCards;
            }
            else {
                // Check if each card already exists in results. If it does not,
                // add it to the list
                for (let card of newCards) {
                    
                    if (!state.resultCards.find(c => c.name === card.name)) {
                        state.resultCards.push(card);
                    }
                }
            }
        },
        updateNoCardsFound (state, val) {
            state.noCardsFound = val;
        },
        updateSymbology (state, val) {
            state.symbology = val;
        },
        createNewDeck (state, { name, cards }) {
            state.decks.push({ name, cards });

            // Save to local storage
            localStorage.decks = JSON.stringify(state.decks);
        },
        addCardsToDeck (state, { deck, card, quantity }) {
            // Check if card exists in deck already
            let cardIndex = state.decks[deck].cards.findIndex(c => c.name === card);

            // Update card quantity
            if (cardIndex >= 0) {
                Vue.set(state.decks[deck].cards[cardIndex], 'quantity', state.decks[deck].cards[cardIndex].quantity + quantity);
            }
            else {
                state.decks[deck].cards.push({ name: card, quantity: quantity });
            }

            // Save to local storage
            localStorage.decks = JSON.stringify(state.decks);
        },
        removeCardFromDeck (state, { deck, card, quantity }) {
            let cardIndex = state.decks[deck].cards.findIndex(c => c.name === card);
            
            if (cardIndex >= 0) {
                // Remove all cards from deck
                if (quantity === 0) {
                    Vue.delete(state.decks[deck].cards, cardIndex);

                    let cardResultIndex = state.resultCards.findIndex(c => c.name === card);
        
                    if (cardResultIndex >= 0) {
                        // remove card from result set
                        Vue.delete(state.resultCards, cardResultIndex);
                    }
                }
                else {
                    Vue.set(state.decks[deck].cards[cardIndex], 'quantity', state.decks[deck].cards[cardIndex].quantity - 1);
                }
            }

            // Save to local storage
            localStorage.decks = JSON.stringify(state.decks);
        },
        clearSearchState (state) {
            state.searchTerm = '';
            state.resultCards = [];
        },
        loadDecksFromLocalStorage (state) {
            if (!!localStorage.decks) {
                state.decks = JSON.parse(localStorage.decks);
            }
        },
        updateClearSearchFlag (state, val) {
            state.clearResultsOnNewSearch = val;
        },
        removeDeck (state, deckName) {
            let deckIndex = state.decks.findIndex(d => d.name === deckName);

            if (deckIndex >= 0) {
                Vue.delete(state.decks, deckIndex);
                state.resultCards = [];
            }

            // Save to local storage
            localStorage.decks = JSON.stringify(state.decks);
        }
    },
    actions: {
        async getCards({ state, commit }) {
            commit('updateLoadingSearch', true);
            commit('updateNoCardsFound', false);

            await axios.get(state.scryfallApi + 'cards/search?' + state.baseSearchParams + '+name%3D' + state.searchTerm).then(response => {
                commit('updateCardResults', response.data.data);
            })
            .catch(error => {
                console.log('Error searching on Scryfall API - ' + error);
                commit('updateCardResults', []);
                if (error.response.status === 404) {
                    commit('updateNoCardsFound', true);
                }
            })
            .then(() => {
                commit('updateLoadingSearch', false);
            });
        },

        async getSymbology({ state, commit }) {
            await axios.get(state.scryfallApi + 'symbology').then(response => {
                commit('updateSymbology', response.data.data);
            })
            .catch(error => {
                console.log('Error loading symbology on Scryfall API - ' + error);
            })
        }
    },
});
