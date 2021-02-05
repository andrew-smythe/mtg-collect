import Vue from "vue";
import Vuex from "vuex";

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
    },
    getters: {},
    mutations: {
        updateSearchTerm (state, payload) {
            state.searchTerm = payload;
        },
        updateLoadingSearch (state, payload) {
            state.loadingSearch = payload;
        },
        updateCardResults (state, payload) {
            state.resultCards = payload;
        },
        updateNoCardsFound (state, payload) {
            state.noCardsFound = payload;
        },
        updateSymbology (state, payload) {
            state.symbology = payload;
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
