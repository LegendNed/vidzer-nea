import { createApp } from 'vue'
import App from './App.vue'
import router from './util/router'
import store from './util/store'

createApp(App).use(store).use(router).mount('#app')
