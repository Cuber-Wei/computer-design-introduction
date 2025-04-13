import {createApp} from 'vue'
import {DatePicker} from 'ant-design-vue';
import router from './router'

import App from './App.vue'

import './style.css'
import 'ant-design-vue/dist/reset.css';

import Filter from '@ant-design/icons-vue';

const app = createApp(App)
app.use(DatePicker).use(router).component(Filter.name, Filter);
app.mount('#app')