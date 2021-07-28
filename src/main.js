import Vue from "vue";
import App from "./App.vue";
import './components/Icon'
import "./plugins/element.js";

Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#app");
