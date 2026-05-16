<script setup lang="ts">
import { computed } from 'vue'
import type { LessonContentBlock, LessonTone } from '../types'

defineOptions({
  name: 'LessonBlock'
})

const props = defineProps<{
  item: LessonContentBlock
  blockId?: string
}>()

const toneClassMap: Record<LessonTone, string> = {
  info: 'tone-info',
  tip: 'tone-tip',
  warning: 'tone-warning',
  success: 'tone-success'
}

const noteToneClass = computed(() => {
  if (props.item.type !== 'note') {
    return ''
  }

  return toneClassMap[props.item.tone ?? 'info']
})
</script>

<template>
  <article :id="blockId" class="lesson-block">
    <section v-if="item.type === 'section'" class="section-card">
      <div class="section-heading">
        <div>
          <p class="section-kicker">Section</p>
          <h2>{{ item.title }}</h2>
        </div>
        <span class="section-chip">{{ item.content.length }} blocks</span>
      </div>

      <p v-if="item.description" class="section-description">
        {{ item.description }}
      </p>

      <div class="section-content">
        <LessonBlock
          v-for="(contentItem, contentIndex) in item.content"
          :key="contentIndex"
          :item="contentItem"
        />
      </div>
    </section>

    <div v-else-if="item.type === 'table'" class="table-wrapper">
      <table class="lesson-table">
        <thead>
          <tr>
            <th v-for="(header, index) in item.headers" :key="index">
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in item.rows" :key="rowIndex">
            <td v-for="(cell, cellIndex) in row" :key="cellIndex">
              {{ cell }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="item.type === 'note'" class="note-card" :class="noteToneClass">
      <p v-if="item.title" class="block-title">
        {{ item.title }}
      </p>
      <p class="note-text">
        {{ item.text }}
      </p>
    </div>

    <div v-else-if="item.type === 'list'" class="list-card">
      <p v-if="item.title" class="block-title">
        {{ item.title }}
      </p>
      <ul class="bullet-list">
        <li v-for="(listItem, index) in item.items" :key="index">
          {{ listItem }}
        </li>
      </ul>
    </div>

    <div v-else-if="item.type === 'example'" class="example-card">
      <div class="block-title-row">
        <p class="block-title">Example</p>
      </div>

      <div class="example-grid">
        <div class="example-panel">
          <span class="example-label">Bulgarian</span>
          <p class="example-bg">{{ item.bg }}</p>
        </div>
        <div class="example-panel">
          <span class="example-label">English</span>
          <p class="example-en">{{ item.en }}</p>
        </div>
      </div>

      <p v-if="item.note" class="example-note">
        {{ item.note }}
      </p>
    </div>

    <div v-else-if="item.type === 'cards'" class="cards-card">
      <p v-if="item.title" class="block-title">
        {{ item.title }}
      </p>
      <div class="card-grid">
        <article v-for="(card, index) in item.cards" :key="index" class="mini-card">
          <p class="mini-card-front">{{ card.front }}</p>
          <p class="mini-card-back">{{ card.back }}</p>
          <p v-if="card.hint" class="mini-card-hint">{{ card.hint }}</p>
        </article>
      </div>
    </div>

    <div v-else-if="item.type === 'quiz'" class="quiz-card">
      <p class="block-title">Check yourself</p>
      <p class="quiz-question">{{ item.question }}</p>
      <p class="quiz-answer"><span>Answer:</span> {{ item.answer }}</p>

      <div v-if="item.choices?.length" class="choice-row">
        <span v-for="(choice, index) in item.choices" :key="index" class="choice-pill">
          {{ choice }}
        </span>
      </div>

      <p v-if="item.note" class="quiz-note">{{ item.note }}</p>
    </div>

    <div v-else-if="item.type === 'rule'" class="rule-card">
      <p v-if="item.title" class="block-title">{{ item.title }}</p>
      <ul class="bullet-list">
        <li v-for="(bullet, index) in item.bullets" :key="index">{{ bullet }}</li>
      </ul>
      <p v-if="item.note" class="rule-note">{{ item.note }}</p>
    </div>

    <div v-else class="item-card">
      <div v-if="item.letter" class="item-main">
        <span class="big">{{ item.letter }}</span>
        <span class="item-sub">{{ item.sound }}</span>
      </div>
      <div v-else class="item-main">
        <span class="big">{{ item.bg }}</span>
        <span class="item-sub">{{ item.en }}</span>
      </div>
      <p v-if="item.hint" class="item-hint">{{ item.hint }}</p>
    </div>
  </article>
</template>

<style scoped>
.lesson-block {
  scroll-margin-top: 1.25rem;
}

.section-card,
.note-card,
.list-card,
.example-card,
.cards-card,
.quiz-card,
.rule-card,
.item-card,
.table-wrapper {
  border: 1px solid rgba(255, 255, 255, 0.11);
  border-radius: 14px;
  background: rgba(5, 11, 25, 0.54);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.16);
}

.section-card {
  padding: 0.95rem;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  align-items: start;
  margin-bottom: 0.35rem;
}

.section-kicker,
.block-title,
.example-label {
  margin: 0;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  font-size: 0.74rem;
  color: #ffc86f;
}

.section-card h2 {
  margin: 0.22rem 0 0;
  font-size: 1.07rem;
}

.section-chip {
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  padding: 0.35rem 0.62rem;
  background: rgba(8, 18, 30, 0.68);
  color: #9fbbc0;
  font-size: 0.8rem;
  white-space: nowrap;
}

.section-description {
  margin: 0.15rem 0 0.85rem;
  color: #c2d2d6;
}

.section-content {
  display: grid;
  gap: 0.7rem;
}

.table-wrapper {
  overflow: hidden;
  background: rgba(5, 11, 25, 0.58);
}

.lesson-table {
  width: 100%;
  border-collapse: collapse;
}

.lesson-table thead {
  background: rgba(12, 35, 44, 0.92);
  font-weight: 700;
}

.lesson-table th {
  padding: 0.8rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffc86f;
}

.lesson-table td {
  padding: 0.72rem 0.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  color: #e7f1f3;
}

.lesson-table tbody tr:hover {
  background: rgba(35, 79, 96, 0.38);
  transition: background 0.14s;
}

.note-card,
.list-card,
.example-card,
.cards-card,
.quiz-card,
.rule-card,
.item-card {
  padding: 0.85rem 0.9rem;
}

.note-text,
.example-note,
.quiz-note,
.rule-note,
.item-hint {
  margin: 0.45rem 0 0;
  color: #d2e0e3;
}

.tone-info {
  background: linear-gradient(180deg, rgba(20, 58, 80, 0.92), rgba(10, 30, 44, 0.95));
}

.tone-tip {
  background: linear-gradient(180deg, rgba(32, 70, 45, 0.92), rgba(15, 33, 23, 0.95));
}

.tone-warning {
  background: linear-gradient(180deg, rgba(88, 54, 16, 0.92), rgba(43, 28, 8, 0.95));
}

.tone-success {
  background: linear-gradient(180deg, rgba(24, 69, 60, 0.92), rgba(11, 28, 24, 0.95));
}

.bullet-list {
  margin: 0.45rem 0 0;
  padding-left: 1.1rem;
  color: #e7f1f3;
}

.bullet-list li + li {
  margin-top: 0.35rem;
}

.block-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.45rem;
}

.example-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
}

.example-panel {
  border: 1px solid rgba(255, 255, 255, 0.11);
  border-radius: 12px;
  background: rgba(10, 22, 35, 0.66);
  padding: 0.75rem;
}

.example-bg,
.example-en,
.quiz-question,
.quiz-answer,
.mini-card-front,
.mini-card-back,
.item-main {
  margin: 0;
}

.example-bg,
.example-en {
  font-size: 1.02rem;
  line-height: 1.45;
}

.example-bg {
  color: #f3fbfc;
}

.example-en {
  color: #d1dee2;
}

.cards-card,
.quiz-card,
.rule-card {
  display: grid;
  gap: 0.65rem;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.65rem;
}

.mini-card {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(18, 42, 54, 0.92), rgba(13, 30, 38, 0.95));
  padding: 0.75rem;
}

.mini-card-front {
  font-size: 1rem;
  font-weight: 700;
  color: #f5fbfc;
}

.mini-card-back {
  margin-top: 0.3rem;
  color: #b7c9cc;
}

.mini-card-hint,
.choice-pill {
  margin-top: 0.35rem;
  color: #9fbbc0;
  font-size: 0.86rem;
}

.choice-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.choice-pill {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  padding: 0.28rem 0.58rem;
  background: rgba(255, 255, 255, 0.04);
}

.quiz-question {
  color: #f2fafb;
  font-size: 1rem;
}

.quiz-answer span {
  color: #ffc86f;
  font-weight: 700;
}

.item-card {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.item-main {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
}

.big {
  font-size: 1.45rem;
  font-weight: 700;
  color: #f5fbfc;
}

.item-sub {
  color: #b7c9cc;
}

@media (max-width: 640px) {
  .example-grid {
    grid-template-columns: 1fr;
  }

  .section-heading {
    flex-direction: column;
    align-items: start;
  }

  .section-chip {
    align-self: flex-start;
  }
}
</style>