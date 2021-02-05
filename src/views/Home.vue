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
                        @click:row="showCard"
                    >
                        <template v-slot:[`item.mana_cost`]="{item}" v-if="symbology.length > 0">
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
                        <template v-slot:[`item.add`]="{item}">
                            <v-btn x-small fab color="green" @click.stop="addCardToDeck(item.name)" dark class="pa-0">
                                <v-icon small>fa-plus</v-icon>
                            </v-btn>
                        </template>
                    </v-data-table>                       

                </v-card-text>
            </v-card>
        </v-col>
        
        <v-dialog v-model="showCardDialog" max-width="300px">
            <img :src="currentShowCard">
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

export default {
  data: function () {
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
          currentShowCard: '',
          showCardDialog: false,
      }
  },
  computed: {
      ...mapState([
          'loadingSearch',
          'noCardsFound',
          'resultCards',
          'symbology',
      ]),
      searchTerm: {
          get: function () {
              return this.$store.state.searchTerm;
          },
          set: function (val) {
              this.$store.commit('updateSearchTerm', val);
          }
      }
  },
  methods: {
      executeSearch: function () {
          this.$store.dispatch('getCards');
      },
      loadSymbolImages: function (symbols) {
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
      },
      addCardToDeck: function(card) {
          console.log(card);
      },
      showCard: function (card) {
          this.currentShowCard = card.image_uris.normal;
          this.showCardDialog = true;
      }
  },
  created: function () {
      this.$store.dispatch('getSymbology');
  }
};
</script>
