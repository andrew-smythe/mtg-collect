<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
        <v-app-bar-nav-icon @click.stop="navigation = !navigation"></v-app-bar-nav-icon>
    </v-app-bar>
        <v-navigation-drawer
            app
            v-model="navigation"
            absolute
            temporary
        >
            <v-list nav dense>
                <v-list-item two-line>
                    <v-list-item-avatar class="mr-3">
                        <img :src="logo">
                    </v-list-item-avatar>

                    <v-list-item-content>
                        <v-list-item-title class="d-flex align-center">mtg-collect</v-list-item-title>
                        <v-list-item-subtitle>By Andrew Smythe</v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>

                <v-divider></v-divider>

                <v-list-item
                    v-for="(item, key) in menu"
                    :key="key"
                    link
                    :href="item.href"
                    :to="item.route"
                    :target="!!item.href ? 'blank' : ''"
                >
                    <v-list-item-icon class="ml-2 mr-5">
                        <v-icon>{{ item.icon }}</v-icon>
                    </v-list-item-icon>
                    
                    <v-list-item-content>
                        <v-list-item-title>{{ item.text }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>

                <v-divider></v-divider>
            </v-list>
            
            <div class="d-flex justify-center align-end mt-5">
                <a href="https://www.vuejs.org" target="blank">
                    <img style="max-width: 100px" :src="vueLogo">
                </a>
            </div>

            <div class="d-flex justify-center mt-5">
                <a href="https://www.vuetifyjs.com" target="blank">
                    <img style="max-width: 100px" :src="vuetifyLogo">
                </a>
            </div>
        </v-navigation-drawer>

    <v-main>
        <v-container>
            <router-view></router-view>
        </v-container>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'mtg-collect',

  components: {
  },

  data: () => ({
    navigation: false,
    logo: require('./assets/mtg-logo.png'),
    vueLogo: require('./assets/logo.png'),
    vuetifyLogo: require('./assets/vuetify-logo.png'),
    menu: [
        {
            icon: 'fa-search',
            text: 'Individual Card Search',
            route: '/',
        },
        {
            icon: 'fa-list',
            text: 'Deck Builder',
            route: '/decks',
        },
        {
            icon: 'fab fa-github',
            text: 'Source',
            href: 'https://github.com/andrew-smythe/mtg-collect',
        }
    ]
  }),
};
</script>
