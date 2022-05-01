import { createApp } from 'vue'
import App from './App.vue'
import { setupDirectives } from './plugins/directives'

const app = createApp(App)

setupDirectives(app)

app.mount('#app')
