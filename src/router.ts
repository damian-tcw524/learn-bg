import { createRouter, createWebHashHistory } from 'vue-router'
import Home from './Home.vue'
import Lesson from './Lesson.vue'
import Flashcards from './Flashcards.vue'
import FlashcardStats from './FlashcardStats.vue'
import Quiz from './Quiz.vue'
import GrammarLab from './GrammarLab.vue'
import Listening from './Listening.vue'
import Progress from './Progress.vue'
import Settings from './Settings.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/lesson/:id', component: Lesson },
    { path: '/flashcards', component: Flashcards },
    { path: '/flashcards/stats', component: FlashcardStats },
    { path: '/quiz', component: Quiz },
    { path: '/grammar-lab', component: GrammarLab },
    { path: '/listening', component: Listening },
    { path: '/progress', component: Progress },
    { path: '/settings', component: Settings }
  ]
})

export default router