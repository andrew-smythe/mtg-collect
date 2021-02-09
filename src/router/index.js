import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import DeckEditor from "../views/DeckEditor.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
      path: "/decks",
      name: "Deck Editor",
      component: DeckEditor,
  }
];

const router = new VueRouter({
    mode: 'history',
    routes
});

export default router;
