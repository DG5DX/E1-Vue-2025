// FILE: main.js

import { createApp } from 'vue'
import {router} from "./routes/routes.js"
import { Quasar } from 'quasar'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css'
import '@quasar/extras/material-icons-round/material-icons-round.css'
import '@quasar/extras/material-icons-sharp/material-icons-sharp.css'
import '@quasar/extras/material-symbols-outlined/material-symbols-outlined.css'
import '@quasar/extras/material-symbols-rounded/material-symbols-rounded.css'
import '@quasar/extras/material-symbols-sharp/material-symbols-sharp.css'
import '@quasar/extras/fontawesome-v6/fontawesome-v6.css'
import '@quasar/extras/ionicons-v4/ionicons-v4.css'
import '@quasar/extras/line-awesome/line-awesome.css'

import { createPinia } from 'pinia'
import  piniaPluginPersistedState  from 'pinia-plugin-persistedstate'

// Import Quasar css
import 'quasar/src/css/index.sass'

// Assumes your root component is App.vue
// and placed in same folder as main.js
import App from './App.vue'

const pinia = createPinia()

pinia.use(piniaPluginPersistedState)

const app = createApp(App)  // Aquí usamos 'app' directamente

// Usa pinia y quasar en la instancia de la app
app.use(pinia)
app.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
})

app.use(router)

app.mount('#app') // Monta la app después de haber agregado todas las dependencias
