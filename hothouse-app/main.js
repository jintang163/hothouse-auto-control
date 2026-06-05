import { createSSRApp } from 'vue'
import App from './App.vue'
import uviewPlus from 'uview-plus'
import store from './store'
import * as config from './config'

export function createApp() {
  const app = createSSRApp(App)
  
  app.config.globalProperties.$config = config
  app.config.globalProperties.$baseUrl = config.baseUrl
  
  app.use(uviewPlus)
  app.use(store)
  
  return { app }
}
