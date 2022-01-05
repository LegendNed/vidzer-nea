import { createApp } from 'vue'

import '@/assets/styles/main.css'
import '@/assets/styles/theme.css'
import 'primeicons/primeicons.css';

import router from './util/router'
import store from './util/store'

import Button from 'primevue/button';

import MainScreen from './App.vue'
const App = createApp(MainScreen)

// Initialise PLugins
App
    .use(store)
    .use(router)

// Initialise custom components
App
    .component('Button', Button)

// Mount the app
App.mount('#app')