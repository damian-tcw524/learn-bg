import { createRouter, createWebHashHistory } from 'vue-router'
import Home from './Home.vue'
import Lesson from './Lesson.vue'
import Flashcards from './Flashcards.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/lesson/:id', component: Lesson },
    { path: '/flashcards', component: Flashcards }
  ]
})

export default router