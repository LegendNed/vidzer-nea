import { createApp } from 'vue'

import '@/static/styles/main.css'
import '@/static/styles/theme.css'
import 'primeicons/primeicons.css';

import store from './util/store'
import router from './util/router'
import plugins from './util/plugins/'
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';

import DataTable from 'primevue/datatable';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Toast from 'primevue/toast';

import MainScreen from './App.vue'
const App = createApp(MainScreen)

// Initialise PLugins
App
    .use(store)
    .use(router)
    .use(plugins)
    .use(PrimeVue)
    .use(ToastService)

// Initialise custom components from PrimeFaces
App
    .component('DataTable', DataTable)
    .component('InputText', InputText)
    .component('Dropdown', Dropdown)
    .component('Button', Button)
    .component('Dialog', Dialog)
    .component('Column', Column)
    .component('Toast', Toast)

// Mount the app
App.mount('#app')