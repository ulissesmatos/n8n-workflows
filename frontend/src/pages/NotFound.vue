<template>
  <div class="not-found">
    <div class="content">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <div class="actions">
        <router-link
          to="/"
          class="btn btn-primary"
        >
          Go Home
        </router-link>
        <button
          class="btn btn-secondary"
          @click="goBack"
        >
          Go Back
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function goBack() {
  router.back();
}
</script>

<style scoped>
.not-found {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  text-align: center;
  max-width: 500px;
  padding: 2rem;
  background: #0b0b0b;
  border: 1px solid #242424;
  border-radius: 16px;
}

.content h1 {
  font-size: 6rem;
  margin: 0;
  color: #f0f0f0;
  font-weight: 700;
}

.content h2 {
  font-size: 2rem;
  margin: 0.5rem 0;
  color: #f0f0f0;
}

.content p {
  color: #a7a7a7;
  font-size: 1.125rem;
  margin: 1rem 0 2rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
</style>
