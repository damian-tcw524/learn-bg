<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { appendFlashcardAttempt, appendFlashcardSession } from './flashcardStats'
import type { FlashcardData, FlashcardItem, FlashcardTopic } from './types'
import { loadFlashcardStats } from './flashcardStats'

type FrontLanguage = 'bg' | 'en' | 'mixed'

type DeckCard = {
  card: FlashcardItem
  front: 'bg' | 'en'
}

const router = useRouter()

const data = ref<FlashcardData | null>(null)
const loading = ref(true)
const loadError = ref('')

const selectedTopicIds = ref<string[]>([])
const frontMode = ref<FrontLanguage>('mixed')

const deck = ref<DeckCard[]>([])
const currentIndex = ref(0)
const showBack = ref(false)
const showBackNext = ref(false)
const dragX = ref(0)
const exitingCard = ref<DeckCard | null>(null)
const exitingDragX = ref(0)
const exitingAnimating = ref(false)
const startX = ref<number | null>(null)
const dragged = ref(false)
const cardReady = ref(false)
const animatingOut = ref(false)
const cardShellRef = ref<HTMLElement | null>(null)

const roundCorrect = ref(0)
const roundWrong = ref(0)
const roundSaved = ref(false)

const swipeThreshold = 40
const swipeVelocityThreshold = 0.45 // px per ms (~450 px/s)
const lastMoveTime = ref<number | null>(null)
const lastMoveX = ref<number>(0)
const prevMoveTime = ref<number | null>(null)
const prevMoveX = ref<number>(0)

const topics = computed<FlashcardTopic[]>(() => data.value?.topics ?? [])

const filteredCards = computed<FlashcardItem[]>(() => {
  const cards = data.value?.cards ?? []
  if (!selectedTopicIds.value.length) {
    return cards
  }

  return cards.filter((card) => card.topics.some((topicId) => selectedTopicIds.value.includes(topicId)))
})

const currentCard = computed<DeckCard | null>(() => deck.value[currentIndex.value] ?? null)
const nextCard = computed<DeckCard | null>(() => deck.value[currentIndex.value + 1] ?? null)

const roundCompleted = computed(() => deck.value.length > 0 && currentIndex.value >= deck.value.length)

const frontLanguageLabel = computed(() => {
  const card = currentCard.value
  if (!card) {
    return ''
  }
  return card.front === 'bg' ? 'Bulgarian' : 'English'
})

const backLanguageLabel = computed(() => {
  const card = currentCard.value
  if (!card) {
    return ''
  }
  return card.front === 'bg' ? 'English' : 'Bulgarian'
})

const frontText = computed(() => {
  const card = currentCard.value
  if (!card) {
    return ''
  }

  return card.front === 'bg' ? card.card.bg : card.card.en
})

const backText = computed(() => {
  const card = currentCard.value
  if (!card) {
    return ''
  }

  return card.front === 'bg' ? card.card.en : card.card.bg
})

const accentAlpha = computed(() => Math.min(Math.abs(dragX.value) / 300, 0.95))
const accentBoxShadow = computed(() => {
  if (dragX.value > 0) {
    return `0 20px 40px rgba(123,237,167,${accentAlpha.value})`
  }
  if (dragX.value < 0) {
    return `0 20px 40px rgba(255,120,120,${accentAlpha.value})`
  }
  return 'none'
})

const accentBorder = computed(() => {
  if (dragX.value > 0) {
    return `rgba(123,237,167,${accentAlpha.value})`
  }
  if (dragX.value < 0) {
    return `rgba(255,120,120,${accentAlpha.value})`
  }
  return 'rgba(255,255,255,0.12)'
})

function shuffle<T>(input: T[]): T[] {
  const arr = [...input]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function pickFrontLanguage(): 'bg' | 'en' {
  if (frontMode.value === 'bg') {
    return 'bg'
  }
  if (frontMode.value === 'en') {
    return 'en'
  }
  return Math.random() > 0.5 ? 'bg' : 'en'
}

function rebuildDeck(): void {
  // Spaced-repetition inspired weighting: prioritize cards with more wrongs than corrects
  const stats = loadFlashcardStats()

  const expanded: FlashcardItem[] = []
  for (const card of filteredCards.value) {
    const attempts = stats.attempts.filter((a) => a.cardId === card.id)
    const correct = attempts.filter((a) => a.correct).length
    const wrong = attempts.filter((a) => !a.correct).length

    // weight: base 1, increase for wrong answers; clamp repeats to [1..4]
    const repeats = Math.min(4, Math.max(1, 1 + (wrong - correct)))

    for (let i = 0; i < repeats; i += 1) {
      expanded.push(card)
    }
  }

  const nextDeck = shuffle(expanded).map((card) => ({ card, front: pickFrontLanguage() }))

  deck.value = nextDeck
  currentIndex.value = 0
  showBack.value = false
  dragX.value = 0
  roundCorrect.value = 0
  roundWrong.value = 0
  roundSaved.value = false
  cardReady.value = false
  // ensure no flip/transition on first paint
  nextTick(() => {
    cardReady.value = true
  })
}

function toggleTopic(topicId: string): void {
  const exists = selectedTopicIds.value.includes(topicId)
  if (exists) {
    selectedTopicIds.value = selectedTopicIds.value.filter((id) => id !== topicId)
  } else {
    selectedTopicIds.value = [...selectedTopicIds.value, topicId]
  }

  rebuildDeck()
}

function setFrontMode(mode: FrontLanguage): void {
  frontMode.value = mode
  rebuildDeck()
}

function flipCard(slot: 'top' | 'back' = 'top'): void {
  if (dragged.value) return

  if (slot === 'back') {
    if (!nextCard.value) return
    // allow flipping the next card while top is animating out
    showBackNext.value = !showBackNext.value
    return
  }

  if (!currentCard.value || animatingOut.value) return
  showBack.value = !showBack.value
}

function saveRoundIfNeeded(): void {
  if (roundSaved.value) {
    return
  }

  const total = roundCorrect.value + roundWrong.value
  if (!total) {
    return
  }

  appendFlashcardSession({
    timestamp: new Date().toISOString(),
    topicIds: selectedTopicIds.value.length ? selectedTopicIds.value : topics.value.map((topic) => topic.id),
    total,
    correct: roundCorrect.value,
    wrong: roundWrong.value
  })

  roundSaved.value = true
}

async function registerAnswer(correct: boolean): Promise<void> {
  const active = currentCard.value
  if (!active || !showBack.value) {
    return
  }

  const width = window.innerWidth
  const extra = 200
  const targetX = correct ? width + extra : -(width + extra)

  exitingCard.value = active
  exitingDragX.value = dragX.value
  exitingAnimating.value = false

  // record attempt
  appendFlashcardAttempt({
    timestamp: new Date().toISOString(),
    cardId: active.card.id,
    topics: active.card.topics,
    correct
  })

  if (correct) {
    roundCorrect.value += 1
  } else {
    roundWrong.value += 1
  }

  // prepare next card: preserve whether the user already flipped the next card
  const nextWasFlipped = showBackNext.value
  dragX.value = 0
  currentIndex.value += 1
  showBack.value = nextWasFlipped
  showBackNext.value = false
  animatingOut.value = false
  await nextTick()

  requestAnimationFrame(() => {
    exitingAnimating.value = true
    exitingDragX.value = targetX
  })

  setTimeout(() => {
    exitingCard.value = null
    exitingAnimating.value = false
  }, 180)

  if (currentIndex.value >= deck.value.length) {
    saveRoundIfNeeded()
  }
}

function onPointerDown(event: PointerEvent): void {
  if (!currentCard.value || !showBack.value) {
    return
  }

  if (animatingOut.value) return

  // prevent the browser from interpreting this touch as a page scroll
  try {
    event.preventDefault()
  } catch {}

  startX.value = event.clientX
  dragged.value = false

  try {
    ;(event.target as Element).setPointerCapture?.(event.pointerId)
  } catch {}
  lastMoveTime.value = performance.now()
  lastMoveX.value = event.clientX
  prevMoveTime.value = lastMoveTime.value
  prevMoveX.value = lastMoveX.value
}

function onPointerMove(event: PointerEvent): void {
  if (startX.value === null || animatingOut.value) {
    return
  }

  dragX.value = event.clientX - startX.value
  if (Math.abs(dragX.value) > 3) {
    dragged.value = true
  }
  prevMoveTime.value = lastMoveTime.value
  prevMoveX.value = lastMoveX.value
  lastMoveTime.value = performance.now()
  lastMoveX.value = event.clientX
}

function onPointerUp(): void {
  if (startX.value === null) {
    return
  }
  let velocity = 0
  if (prevMoveTime.value !== null && lastMoveTime.value !== null && lastMoveTime.value > prevMoveTime.value) {
    const dt = Math.max(6, lastMoveTime.value - prevMoveTime.value)
    velocity = (lastMoveX.value - prevMoveX.value) / dt
  }

  if (dragX.value >= swipeThreshold || velocity > swipeVelocityThreshold) {
    registerAnswer(true)
  } else if (dragX.value <= -swipeThreshold || velocity < -swipeVelocityThreshold) {
    registerAnswer(false)
  } else {
    // snap back
    const el = cardShellRef.value
    if (el) {
      el.style.transition = 'transform 220ms ease'
      dragX.value = 0
      setTimeout(() => {
        el.style.transition = ''
      }, 260)
    }
  }

  startX.value = null
  try {
    ;(document as any).releasePointerCapture?.()
  } catch {}

  setTimeout(() => {
    dragged.value = false
  }, 0)
}

function openStats(): void {
  router.push('/flashcards/stats')
}

onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/flashcards.json`)
    if (!res.ok) {
      throw new Error('Could not load flashcard data.')
    }

    const json = (await res.json()) as FlashcardData
    data.value = json
    selectedTopicIds.value = json.topics.map((topic) => topic.id)
    rebuildDeck()
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Unexpected error while loading flashcards.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="flashcards-page">
    <section class="hero">
      <div>
        <p class="eyebrow">Flashcards</p>
        <h1>Word Trainer</h1>
        <p class="subtitle">Flip a card, guess the meaning, then swipe right if correct or left if wrong.</p>
      </div>

      <button class="stats-btn" type="button" @click="openStats">View Statistics</button>
    </section>

    <section class="controls" v-if="!loading && !loadError && data">
      <div>
        <p class="controls-label">Topics</p>
        <div class="topic-list">
          <button
            v-for="topic in topics"
            :key="topic.id"
            type="button"
            class="topic-chip"
            :class="{ active: selectedTopicIds.includes(topic.id) }"
            @click="toggleTopic(topic.id)"
          >
            {{ topic.label }}
          </button>
        </div>
      </div>

      <div>
        <p class="controls-label">Front Language</p>
        <div class="mode-list">
          <button type="button" class="mode-chip" :class="{ active: frontMode === 'mixed' }" @click="setFrontMode('mixed')">Mixed</button>
          <button type="button" class="mode-chip" :class="{ active: frontMode === 'bg' }" @click="setFrontMode('bg')">Bulgarian</button>
          <button type="button" class="mode-chip" :class="{ active: frontMode === 'en' }" @click="setFrontMode('en')">English</button>
        </div>
      </div>
    </section>

    <p v-if="loading" class="status">Loading flashcards...</p>
    <p v-else-if="loadError" class="status error">{{ loadError }}</p>

    <section v-else-if="!deck.length" class="empty-state">
      <h2>No cards in this topic set</h2>
      <p>Select at least one topic to start practicing.</p>
    </section>

    <section v-else-if="roundCompleted" class="round-summary">
      <h2>Round Complete</h2>
      <p>You answered {{ roundCorrect }} correct and {{ roundWrong }} wrong.</p>
      <button class="stats-btn" type="button" @click="rebuildDeck">Shuffle New Round</button>
    </section>

    <section v-else class="card-stage">
      <p class="counter">Card {{ currentIndex + 1 }} / {{ deck.length }}</p>
      <div class="card-stack">
        <div v-if="nextCard" class="card-shell back-shell" :class="{ clickable: animatingOut }" @click.stop="flipCard('back')">
          <div :key="(nextCard && nextCard.card.id) || currentIndex + '-next'" class="card" :class="{ flipped: showBackNext, 'no-anim': !cardReady }" :style="{ '--card-shadow': 'none', '--card-border': 'rgba(255,255,255,0)' }">
            <article class="card-face card-front">
              <p class="card-label">{{ nextCard ? (nextCard.front === 'bg' ? 'Bulgarian' : 'English') : '' }}</p>
              <h2>{{ nextCard ? (nextCard.front === 'bg' ? nextCard.card.bg : nextCard.card.en) : '' }}</h2>
              <small>Tap to flip</small>
            </article>

            <article class="card-face card-back">
              <p class="card-label">{{ nextCard ? (nextCard.front === 'bg' ? 'English' : 'Bulgarian') : '' }}</p>
              <h2>{{ nextCard ? (nextCard.front === 'bg' ? nextCard.card.en : nextCard.card.bg) : '' }}</h2>
              <small>Swipe left if wrong, swipe right if correct</small>
            </article>
          </div>
        </div>

        <div
          v-if="exitingCard"
          class="card-shell exiting-shell"
          :class="{ animating: exitingAnimating }"
          :style="{ transform: `translateX(${exitingDragX}px) rotate(${exitingDragX / 25}deg)` }"
        >
          <div class="card flipped no-anim" :style="{ '--card-shadow': 'none', '--card-border': 'rgba(255,255,255,0)' }">
            <article class="card-face card-front">
              <p class="card-label">{{ exitingCard.front === 'bg' ? 'Bulgarian' : 'English' }}</p>
              <h2>{{ exitingCard.front === 'bg' ? exitingCard.card.bg : exitingCard.card.en }}</h2>
              <small>Tap to flip</small>
            </article>

            <article class="card-face card-back">
              <p class="card-label">{{ exitingCard.front === 'bg' ? 'English' : 'Bulgarian' }}</p>
              <h2>{{ exitingCard.front === 'bg' ? exitingCard.card.en : exitingCard.card.bg }}</h2>
              <small>Swipe left if wrong, swipe right if correct</small>
            </article>
          </div>
        </div>

        <div
          ref="cardShellRef"
          class="card-shell top-shell"
          :class="{ 'click-through': animatingOut }"
          :style="{ transform: `translateX(${dragX}px) rotate(${dragX / 25}deg)` }"
          @click="flipCard('top')"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
          @pointerleave="onPointerUp"
        >
          <div :key="currentCard?.card.id || currentIndex" class="card" :class="{ flipped: showBack, 'no-anim': !cardReady }" :style="{ '--card-shadow': accentBoxShadow, '--card-border': accentBorder }">
            <article class="card-face card-front">
              <p class="card-label">{{ frontLanguageLabel }}</p>
              <h2>{{ frontText }}</h2>
              <small>Tap to flip</small>
            </article>

            <article class="card-face card-back">
              <p class="card-label">{{ backLanguageLabel }}</p>
              <h2>{{ backText }}</h2>
              <small>Swipe left if wrong, swipe right if correct</small>
            </article>
          </div>
        </div>
      </div>

      <div class="answer-controls">
        <button type="button" class="wrong-btn" @click="registerAnswer(false)">Wrong</button>
        <button type="button" class="right-btn" @click="registerAnswer(true)">Correct</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.flashcards-page {
  min-height: 100vh;
  padding: clamp(1rem, 2vw, 2rem);
  color: #ecf6f6;
  background:
    radial-gradient(circle at 20% 10%, rgba(255, 186, 73, 0.2), transparent 30%),
    radial-gradient(circle at 80% 0%, rgba(35, 214, 180, 0.22), transparent 32%),
    linear-gradient(160deg, #0c1630 0%, #0d2d35 48%, #0f1526 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: grid;
  gap: 1rem;
}

.hero,
.controls,
.card-stage,
.empty-state,
.round-summary {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(5, 11, 25, 0.56);
  padding: 1rem;
}

.hero {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.eyebrow {
  margin: 0;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #ffc86f;
  font-size: 0.75rem;
}

h1 {
  margin: 0.25rem 0;
}

.subtitle {
  margin: 0;
  color: #c7d5d8;
}

.stats-btn {
  border: 0;
  border-radius: 10px;
  padding: 0.6rem 0.92rem;
  cursor: pointer;
  color: #1b2329;
  font-weight: 700;
  background: linear-gradient(135deg, #ffd16f, #6bf5cb);
}

.controls {
  display: grid;
  gap: 0.9rem;
}

.controls-label {
  margin: 0 0 0.35rem;
  color: #aec0c5;
}

.topic-list,
.mode-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.topic-chip,
.mode-chip {
  border: 1px solid rgba(255, 255, 255, 0.11);
  background: rgba(17, 35, 44, 0.9);
  color: #d7e8ea;
  border-radius: 999px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
}

.topic-chip.active,
.mode-chip.active {
  border-color: rgba(110, 240, 210, 0.55);
  background: rgba(29, 66, 82, 0.95);
}

.status {
  margin: 0;
  padding: 0.9rem 1rem;
  border-radius: 12px;
  background: rgba(5, 11, 25, 0.56);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.status.error {
  color: #ffb6b6;
}

.counter {
  margin: 0 0 0.7rem;
  color: #9db4ba;
}

.card-shell {
  /* shells are positioned within .card-stack; top/back shells fill the stack */
  position: absolute;
  inset: 0;
  width: 100%;
  /* disable default touch panning while interacting with cards */
  touch-action: none;
  cursor: pointer;
}

.card-stack {
  max-width: 560px;
  width: 100%;
  margin: 0 auto;
  perspective: 1100px;
  position: relative;
  min-height: 300px;
}

.card-shell.back-shell {
  z-index: 1;
  pointer-events: none;
}

.card-shell.back-shell .card {
  transition: none !important;
  transform: none !important;
}

.card-shell.top-shell {
  z-index: 2;
}

.card-shell.exiting-shell {
  z-index: 3;
  pointer-events: none;
  transition: transform 180ms cubic-bezier(.22,.9,.22,1);
}

.card-shell.exiting-shell.animating {
  will-change: transform;
}

.card-shell.back-shell.clickable {
  pointer-events: auto;
}

.card-shell.top-shell.click-through {
  pointer-events: none;
}

.card {
  position: relative;
  width: 100%;
  min-height: 300px;
  transform-style: preserve-3d;
  transition: transform 0.28s ease;
}

.card.no-anim {
  transition: none !important;
}

.card.flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 14px;
  border: 1px solid var(--card-border, rgba(255, 255, 255, 0.12));
  box-shadow: var(--card-shadow, none);
  /* make faces opaque so you can't see through the card */
  background-color: #0f2a31;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 1rem;
}

.card-back {
  transform: rotateY(180deg);
}

/* distinct back-face color so flipped side is obvious */
.card-face.card-back {
  /* distinct back-face color so flipped side is obvious (opaque) */
  background-color: #163e2f;
}

.card-label {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.72rem;
  color: #ffc86f;
}

h2 {
  margin: 0.5rem 0;
  font-size: clamp(1.45rem, 4vw, 2.2rem);
}

small {
  color: #b7c8cc;
}

.answer-controls {
  display: flex;
  justify-content: center;
  gap: 0.7rem;
  margin-top: 0.9rem;
}

.answer-controls button {
  border: 0;
  border-radius: 10px;
  padding: 0.64rem 1rem;
  font-weight: 700;
  cursor: pointer;
}

.wrong-btn {
  color: #fbe9e9;
  background: linear-gradient(135deg, #8f3048, #ba4a5d);
}

.right-btn {
  color: #112229;
  background: linear-gradient(135deg, #7cf2d5, #b9f17b);
}

.empty-state h2,
.round-summary h2 {
  margin: 0;
}

.empty-state p,
.round-summary p {
  color: #c4d2d5;
}

@media (max-width: 700px) {
  .flashcards-page {
    padding: 0.75rem;
  }

  .hero,
  .controls,
  .card-stage,
  .empty-state,
  .round-summary {
    border-radius: 12px;
  }

  .card {
    min-height: 260px;
  }
}
</style>
