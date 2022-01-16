import { createApp } from 'vue'

import '@/assets/styles/main.css'
import '@/assets/styles/theme.css'
import 'primeicons/primeicons.css';

import router from './util/router'
import store from './util/store'
import plugins from './util/plugins/'
import ToastService from 'primevue/toastservice';
import PrimeVue from 'primevue/config';

import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Toast from 'primevue/toast';
import Dropdown from 'primevue/dropdown';

import MainScreen from './App.vue'
const App = createApp(MainScreen)

// Initialise PLugins
App
    .use(store)
    .use(router)
    .use(plugins)
    .use(PrimeVue)
    .use(ToastService)

// Initialise custom components
App
    .component('Button', Button)
    .component('InputText', InputText)
    .component('Toast', Toast)
    .component('Dropdown', Dropdown)

// Mount the app
App.mount('#app')