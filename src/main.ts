import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'

createApp(App).use(router).mount('#app')

function applyBgFontClass(name: string) {
  const root = document.documentElement
  root.classList.remove('bg-font-montserrat', 'bg-font-comfortaa')
  if (name === 'montserrat_alternates') {
    root.classList.add('bg-font-montserrat')
  } else if (name === 'comfortaa') {
    root.classList.add('bg-font-comfortaa')
  }
}

// Apply saved preference on load
try {
  const saved = localStorage.getItem('bg_font') || 'default'
  applyBgFontClass(saved)
} catch (e) {
  // ignore
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}