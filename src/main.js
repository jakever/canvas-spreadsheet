import Vue from "vue";
import App from "./App.vue";
import Example from './example3.vue'
import './components/Icon'
import "./plugins/element.js";

Vue.config.productionTip = false;

new Vue({
  render: h => h(Example)
}).$mount("#app");
