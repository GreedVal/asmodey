import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../views/Home.vue";
import Parser from "../views/Parser.vue";

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/parser", name: "Parser", component: Parser },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
