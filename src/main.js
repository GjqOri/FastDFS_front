import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

// 按需加载ant-design-vue组件
import { Button, Upload, Icon, Table, message, Breadcrumb } from "ant-design-vue";
Vue.use(Button);
Vue.use(Upload);
Vue.use(Icon);
Vue.use(Table);
Vue.use(Breadcrumb);
Vue.prototype.$message = message;
message.config({
  top: `30px`,
  duration: 1,
  maxCount: 3
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
