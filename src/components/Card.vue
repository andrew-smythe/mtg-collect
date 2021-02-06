<template>
    <v-container>
        <v-row>
            <v-col sm="2">
                <img :src="card.image_uris.normal" style="max-height: 350px">
            </v-col>
            <v-col sm="2" class="card-details py-5">
                <v-list two-line style="background-color:rgba(0,0,0,0)">
                    <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title>Name</v-list-item-title>
                            <v-list-item-subtitle>{{ card.name }}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title>Type</v-list-item-title>
                            <v-list-item-subtitle>{{ card.type_line }}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title>Mana Cost</v-list-item-title>
                            <v-list-item-subtitle>
                                <template v-for="(img, key) in loadSymbolImages(card.mana_cost)" >
                                    <img 
                                        v-if="!!img.found"
                                        :key="key" 
                                        :src="img.src"
                                        style="width: 15px; height: 15px"
                                    />
                                    <span v-else :key="key">{{ item.mana_cost }}</span>
                                </template>
                            </v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title>Rarity</v-list-item-title>
                            <v-list-item-subtitle>{{ card.rarity }}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title>Set</v-list-item-title>
                            <v-list-item-subtitle>{{ card.set_name }}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-col>
            <v-col sm="3" class="card-details py-5">
                <v-list two-line style="background-color:rgba(0,0,0,0)">
                    <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title>Oracle Text</v-list-item-title>
                            <v-list-item-subtitle v-html="addSymbolsToText(card.oracle_text)"></v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item v-if="!!card.flavor_text">
                        <v-list-item-content>
                            <v-list-item-title>Flavor Text</v-list-item-title>
                            <v-list-item-subtitle>{{ card.flavor_text }}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title>Print Date</v-list-item-title>
                            <v-list-item-subtitle>{{ card.released_at }}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title>Legality</v-list-item-title>
                            <v-list-item-subtitle>
                                {{ legalityString(card.legalities) }}
                            </v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-col>
        </v-row>
    </v-container>
</template>

<style>

.card-details > ul > li {
    list-style: none;
    margin-bottom: 10px;
}

.card-details ul li strong {
    display: block;
}

.v-list-item__title {
    margin-bottom: 5px !important;
}

.v-list-item__title, .v-list-item__subtitle {
    white-space: normal; 
}

</style>

<script>

import { mapState } from 'vuex';

export default {
    data() {
        return {

        }
    },
    computed: {
        ...mapState([
            'symbology',
        ]),
    },
    props: {
        card: {
            type: Object,
            default: null,
        }
    },
    methods: {
        legalityString: function (legalities) {
            let str = '';
            for (let s in legalities) {
                if (legalities[s] === 'legal') {
                    str += (s.charAt(0).toUpperCase() + s.slice(1) + ', ');
                }
            }
            return str.slice(0, str.length-2);
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
        addSymbolsToText: function (text) {
            let htmlString = text.replace(/\{.*?\}/g, this.symbolToImage);
            htmlString = htmlString.replace(/\n/g, '<span style="display: block;">&nbsp;</span>');
            return htmlString;
        },
        symbolToImage: function (symbol) {
            let foundSymbol = this.symbology.find(s => s.symbol === symbol);
            if (!!foundSymbol) {
                return '<img src="' + foundSymbol.svg_uri + '" style="height: 15px">';
            }
            return symbol;
        }
    },
}
</script>