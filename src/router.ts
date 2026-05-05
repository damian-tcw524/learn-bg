import { createRouter, createWebHistory } from 'vue-router'
import Home from './Home.vue'
import Lesson from './Lesson.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/lesson/:id', component: Lesson }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router