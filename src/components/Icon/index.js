import Vue from 'vue';
import Icon from './index.vue';

Vue.component('Icon', Icon);

// 导入所有的svg（参照webpack文档: http://webpack.github.io/docs/context.html#dynamic-requires ）
// ~function (requireContext) {
//   return requireContext.keys().map(requireContext)
// }(require.context('./svg', false, /\.svg$/))
const requireAll = requireContext => requireContext.keys().map(requireContext);
const req = require.context('./svg', false, /\.svg$/)
requireAll(req);