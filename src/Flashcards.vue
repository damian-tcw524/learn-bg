<template>
  <main class="flashcards-page">
    <section class="placeholder">
      <p class="eyebrow">Flashcards</p>
      <h1>Coming Soon</h1>
      <p>
        This page is reserved for the future flashcard app.
      </p>
    </section>
  </main>
</template>

<style scoped>
.flashcards-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1rem;
  color: #edf8f8;
  background:
    radial-gradient(circle at 18% 22%, rgba(255, 195, 98, 0.2), transparent 30%),
    linear-gradient(160deg, #0d2237, #152a2a 55%, #141f34);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.placeholder {
  width: min(680px, 100%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  background: rgba(8, 18, 30, 0.56);
  padding: 1.25rem;
}

.eyebrow {
  margin: 0;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #ffc86f;
  font-size: 0.75rem;
}

h1 {
  margin: 0.35rem 0;
}

p {
  margin: 0;
  color: #c6d4d7;
}
</style>
