<template>
    <v-row justify="center">
        <v-col>
            <v-card class="pa-3" elevation="5">
                <v-card-text>
                    <v-select
                        label="Select a Deck"
                        solo
                        item-text="name"
                        return-object
                        :items="decks"
                        v-model="selectedDeck"
                    ></v-select>
                    <p class="font-weight-bold" v-if="resultCards.length > 0">Number of Cards in Deck: {{ numCardsInDeck }}</p>
                    <v-btn color="red" dark v-if="!!selectedDeck" @click="deleteDeck(selectedDeck)">Delete this Deck</v-btn>
                </v-card-text>
                <v-card-text class="justify-center d-flex align-center">

                    <!-- Results -->
                    <v-data-table
                        v-if="resultCards.length > 0 && !loadingSearch"
                        :headers="headers"
                        :items="cardsWithQuantities"
                        :items-per-page="-1"
                        class="elevation-3"
                        style="width: 100%"
                        single-expand
                        :expanded.sync="expandedRows"
                        show-expand
                        @click:row="expandRow"
                    >

                        <template v-slot:[`item.mana_cost`]="{ item }" v-if="symbology.length > 0">
                            <template v-for="(img, key) in loadSymbolImages(item.mana_cost)" >
                                <img 
                                    v-if="!!img.found"
                                    :key="key" 
                                    :src="img.src"
                                    style="width: 15px; height: 15px"
                                />
                                <span v-else :key="key">{{ item.mana_cost }}</span>
                            </template>
                        </template>

                        <template v-slot:[`item.quantity`]="{ item }">
                            <v-row justify="center" align="center" class="pa-2">
                                <v-btn x-small icon @click.stop="reduceQuantity(item)">
                                    <v-icon x-small>fa-chevron-down</v-icon>
                                </v-btn>
                                <v-text-field 
                                    v-model="item.quantity"
                                    solo 
                                    disabled
                                    style="max-width:40px" 
                                    hide-details 
                                    class="ma-2"
                                >
                                </v-text-field>
                                <v-btn x-small icon @click.stop="increaseQuantity(item)">
                                    <v-icon x-small>fa-chevron-up</v-icon>
                                </v-btn>
                            </v-row>
                        </template>

                        <template v-slot:[`item.remove`]="{ item }">
                            <v-btn x-small fab color="red" @click.stop="removeCardFromDeck(item.name)" dark class="pa-0">
                                <v-icon x-small>fa-trash</v-icon>
                            </v-btn>
                        </template>

                        <template v-slot:expanded-item="{ headers, item }">
                            <td :colspan="headers.length" style="background-color: rgba(133,133,133,0.15)">
                                <card :card="item"></card>
                            </td>
                        </template>

                    </v-data-table>  
                    
                    <!-- Loading -->
                    <v-progress-circular size="300" width="8" color="primary" indeterminate v-if="loadingSearch">Loading</v-progress-circular>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<style>

</style>

<script>

import { mapState } from 'vuex';
import Card from '../components/Card.vue';

export default {
    data() {
        return {
            selectedDeck: null,
            headers: [
                {
                    text: 'Card Name',
                    align: 'center',
                    sortable: true,
                    value: 'name',
                },
                {
                    text: 'Type',
                    align: 'center',
                    sortable: true,
                    value: 'type_line',
                },
                {
                    text: 'Mana Cost',
                    align: 'center',
                    sortable: true,
                    value: 'mana_cost',
                },
                {
                    text: 'Quantity',
                    align: 'center',
                    sortable: true,
                    value: 'quantity',
                },
                {
                    text: 'Remove Card',
                    align: 'center',
                    sortable: false,
                    value: 'remove',
                }
            ],

            expandedRows: [],
        }
    },
    computed: {
        ...mapState([
            'decks',
            'resultCards',
            'loadingSearch',
            'symbology',
        ]),
        searchTerm: {
            get: function () {
                return this.$store.state.searchTerm;
            },
            set: function (val) {
                this.$store.commit('updateSearchTerm', val);
            }
        },
        cardsWithQuantities: function () {
            let deckList = JSON.parse(JSON.stringify(this.resultCards));

            if (!!this.selectedDeck) {
                let vm = this;
                deckList.forEach(c => {
                    let cardInDeck = vm.selectedDeck.cards.find(dc => dc.name === c.name);

                    if (!!cardInDeck) {
                        c.quantity = cardInDeck.quantity;
                    }
                });
            }

            return deckList;
        },
        numCardsInDeck: function () {
            let total = 0;
            this.cardsWithQuantities.map(cq => cq.quantity).forEach(x => total += x);
            return total;
        }
    },
    methods: {
      expandRow: function(row) {
          let index = this.expandedRows.findIndex(r => r.id === row.id);
          if (index < 0) {
            this.expandedRows.push(row);
          }
          else {
              this.expandedRows.splice(index, 1);
          }
      },
      loadSymbolImages: function (symbols) {
          if (!!symbols) {
            let images = [];
            let symbolArray = symbols.match(/\{.*?\}/g);

            // Find SVG URI for each matched symbol. If no symbol match is found, return null
            // image source to notify caller that no image was found
            for (let symbol of symbolArray) {
                let foundSymbol = this.symbology.find(s => s.symbol === symbol);
                if (!!foundSymbol) {
                    images.push({ src: foundSymbol.svg_uri, found: true });
                }
                else {
                    images.push({ src: null, found: false });
                }
            }

            return images;
          }
          return [ { src: null, found: false } ];
      },
      removeCardFromDeck: function (card) {
          let deckIndex = this.decks.findIndex(d => d.name === this.selectedDeck.name);

          if (deckIndex >= 0) {
              this.$store.commit('removeCardFromDeck', { deck: deckIndex, card: card, quantity: 0 });
          }
      },
      reduceQuantity: function (card) {
          if (card.quantity > 1) {
              let deckIndex = this.decks.findIndex(d => d.name === this.selectedDeck.name);

              if (deckIndex >= 0) {
                  this.$store.commit('removeCardFromDeck', { deck: deckIndex, card: card.name, quantity: 1 });
              }
          }
      },
      increaseQuantity: function (card) {
          if (card.type_line.indexOf('Basic') >= 0 || card.quantity < 4) {
              let deckIndex = this.decks.findIndex(d => d.name === this.selectedDeck.name);

              if (deckIndex >= 0) {
                  this.$store.commit('addCardsToDeck', { deck: deckIndex, card: card.name, quantity: 1 });
              }
          }
      },
      deleteDeck: function (deck) {
          this.$store.commit('removeDeck', deck.name);
          this.selectedDeck = null;
      }
    },
    watch: {
        selectedDeck: async function () {

            // Cards are queryied from the Scryfall API in groups of 6 (to get under its max
            // limit on regular expression type queries). Scryfall limits usage to 50-100ms
            // between requests, so doing one card at a time would not work. The API is
            // meant for querying for cards that match a set of criteria, not necessarily
            // a specific set, which is what we are doing here.

            // A better solution would be to cache the results in a database (or maybe local storage
            // if this would be *purely* a front-end app). However, for the purpose of this
            // testing exercise, this is not the strategy I am going to use as it would take quite
            // a bit more time to implement.

            if (this.selectedDeck != null) {
                this.$store.commit('clearSearchState');

                for (let i = 0; i < Math.ceil(this.selectedDeck.cards.length / 6); i++) {
                    // Prepare query for cards in deck
                    this.searchTerm = '/^' + this.selectedDeck.cards.slice(i*6, (i*6)+6).map(c => c.name).join('$/%20OR%20name%3A/^') + '$/'
                    this.searchTerm = this.searchTerm.replace(/ /g, '%20');
                    
                    // Send query
                    this.$store.dispatch('getCards');

                    // Wait 75ms
                    await new Promise(s => setTimeout(s, 75));
                }
            }
        }
    },
    components: {
        Card,
    },
    mounted: function () {
        this.$store.commit('updateClearSearchFlag', false);
        this.$store.commit('clearSearchState');
    }
}
</script>