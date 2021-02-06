<template>
    <v-row align="start" justify="center">
        <v-col>
            <v-card class="pa-3" elevation="5">
                <v-card-text>
                    <v-text-field label="Search" class="searchArea" solo v-model="searchTerm" hide-details @keyup.enter="executeSearch()">
                        <template v-slot:append-outer>
                            <v-btn color="primary" dark class="ml-2" @click="executeSearch()">Go</v-btn>
                        </template>
                    </v-text-field>
                </v-card-text>
                <v-card-text style="min-height: 600px" class="justify-center d-flex align-center">
                    
                    <!-- Loading -->
                    <v-progress-circular size="300" width="8" color="primary" indeterminate v-if="loadingSearch">Searching...</v-progress-circular>

                    <!-- Results -->
                    <v-data-table
                        v-if="resultCards.length > 0 && !loadingSearch"
                        :headers="headers"
                        :items="resultCards"
                        :items-per-page="20"
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

                        <template v-slot:[`item.add`]="{ item }">
                            <v-btn x-small fab color="green" @click.stop="addCardToDeck(item)" dark class="pa-0">
                                <v-icon small>fa-plus</v-icon>
                            </v-btn>
                        </template>

                        <template v-slot:expanded-item="{ headers, item }">
                            <td :colspan="headers.length" style="background-color: rgba(133,133,133,0.15)">
                                <card :card="item"></card>
                            </td>
                        </template>

                    </v-data-table>                       

                </v-card-text>
            </v-card>
        </v-col>
        <v-dialog max-width="1000px" v-model="addToDeckDialog">
            <v-card>
                <v-toolbar color="primary" dark>
                    <v-toolbar-title v-if="!!cardToAdd">Add {{ cardToAdd.name }} to Deck</v-toolbar-title>
                </v-toolbar>
                <v-card-text class="pt-4 pb-0 mb-0">
                    <v-form ref="deckAddForm">
                        <v-select
                            label="Select a Deck"
                            solo
                            item-text="name"
                            :items="deckList"
                            v-model="selectedDeck"
                            hide-details
                            @change="updateCardsInDeck"
                        ></v-select>
                        <v-text-field 
                            class="pt-4"
                            label="New Deck Name"
                            v-if="selectedDeck === 'Create New Deck'" 
                            solo
                            hide-details
                            v-model="newDeckName"
                        ></v-text-field>
                        <v-text-field
                            class="pt-4"
                            label="Quantity"
                            v-if="!!selectedDeck"
                            solo
                            type="number"
                            :rules="[deckAddRules]"
                            v-model="newCardQuantity"
                        ></v-text-field>
                    </v-form>
                </v-card-text>
                <v-card-actions class="justify-center pt-0 mt-0 pb-3">
                    <v-btn color="green" dark @click="saveDeck" :disabled="!newDeckName || !selectedDeck">Save Deck</v-btn>
                    <v-btn color="red" dark @click="addToDeckDialog = false">Close</v-btn>
                </v-card-actions>
            </v-card>

        </v-dialog>
    </v-row>
</template>

<style>
    .v-text-field.searchArea div.v-input__append-outer {
        margin-top: 6px;
    }
</style>

<script>

import { mapState } from 'vuex';
import Card from '../components/Card.vue';

export default {
  data () {
      return {
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
                  text: 'Rarity',
                  align: 'center',
                  sortable: true,
                  value: 'rarity',
              },
              {
                  text: 'Set',
                  align: 'center',
                  sortable: true,
                  value: 'set_name',
              },
              {
                  text: 'Add to Deck',
                  align: 'center',
                  sortable: false,
                  value: 'add',
              }
          ],
          expandedRows: [],
          addToDeckDialog: false,
          cardToAdd: null,
          selectedDeck: null,
          cardsInDeck: 0,
          newDeckName: '',
          newCardQuantity: 0,
      }
  },
  computed: {
      ...mapState([
          'loadingSearch',
          'noCardsFound',
          'resultCards',
          'symbology',
          'decks',
      ]),
      searchTerm: {
          get: function () {
              return this.$store.state.searchTerm;
          },
          set: function (val) {
              this.$store.commit('updateSearchTerm', val);
          }
      },
      deckList: function () {
          let decks = JSON.parse(JSON.stringify(this.decks));
          decks.unshift({ name: 'Create New Deck', cards: [] });
          return decks;
      },
      deckAddRules: function () {
          if (this.cardToAdd.type_line.includes('Basic')) {
              return true;
          }
          return (v => v <= (4 - this.cardsInDeck) || 'You can only have a maximum of 4 of a single non-Basic card in your deck! There are currently ' + this.cardsInDeck + ' copies of ' + this.cardToAdd.name + ' in this deck.');
      }
  },
  methods: {
      executeSearch: function () {
          this.$store.dispatch('getCards');
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
      addCardToDeck: function(card) {
          this.addToDeckDialog = true;
          this.cardToAdd = card;
          this.cardsInDeck = 0;
          this.newDeckName = '';
          this.newCardQuantity = 0;
          this.selectedDeck = null;
      },
      expandRow: function(row) {
          let index = this.expandedRows.findIndex(r => r.id === row.id);
          if (index < 0) {
            this.expandedRows.push(row);
          }
          else {
              this.expandedRows.splice(index, 1);
          }
      },
      updateCardsInDeck: function (name) {
        if (name === 'Create New Deck') {
            this.cardsInDeck = 0;
        }
        else {
            let deck = this.decks.find(d => d.name === name);
            let card = deck.cards.find(c => c.name === this.cardToAdd.name);
            this.cardsInDeck = !!card ? card.quantity : 0;
        }
      },
      saveDeck: function () {
          if (this.$refs.deckAddForm.validate()) {
            if (!!this.newDeckName) {
                this.$store.commit('createNewDeck', {
                    name: this.newDeckName,
                    cards: [
                        {
                            name: this.cardToAdd.name,
                            quantity: parseInt(this.newCardQuantity),
                        }
                    ]
                });
            }
            else {
                let deckIndex = this.decks.findIndex(d => d.name === this.selectedDeck);

                if (deckIndex >= 0) {
                    this.$store.commit('addCardsToDeck', {
                        deck: deckIndex,
                        card: this.cardToAdd.name,
                        quantity: parseInt(this.newCardQuantity),
                    });
                }
            }
            this.addToDeckDialog = false;
          }
      }
  },
  created: function () {
      this.$store.dispatch('getSymbology');
  },
  components: {
      Card,
  }
};
</script>
