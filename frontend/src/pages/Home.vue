<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          n8n Workflow Library
        </h1>
        <p class="hero-subtitle">
          Discover, learn, and share powerful n8n automation workflows
        </p>
        <div class="hero-actions">
          <router-link
            to="/workflows"
            class="btn btn-primary btn-large"
          >
            Explore Workflows
          </router-link>
          <a
            href="https://n8n.io"
            target="_blank"
            class="btn btn-secondary btn-large"
          >
            Learn n8n
          </a>
        </div>
      </div>
    </section>

    <!-- Featured Workflows -->
    <section class="featured-section">
      <div class="container">
        <h2 class="section-title">
          Featured Workflows
        </h2>
        <p class="section-subtitle">
          Handpicked automation workflows by the community
        </p>

        <div
          v-if="loading"
          class="loading"
        >
          <div class="spinner" />
          <p>Loading featured workflows...</p>
        </div>

        <div
          v-else-if="featuredWorkflows.length > 0"
          class="workflows-grid"
        >
          <router-link
            v-for="workflow in featuredWorkflows"
            :key="workflow.id"
            :to="`/workflows/${workflow.slug}`"
            class="workflow-card-link"
          >
            <div class="workflow-card">
              <div
                v-if="workflow.thumbnailUrl"
                class="card-image"
              >
                <img
                  :src="workflow.thumbnailUrl"
                  :alt="workflow.title"
                >
              </div>
              <div
                v-else
                class="card-placeholder"
              >
                <span>⚡</span>
              </div>

              <div class="card-content">
                <h3 class="card-title">
                  {{ workflow.title }}
                </h3>
                <p class="card-description">
                  {{ truncate(workflow.description, 80) }}
                </p>

                <div class="card-meta">
                  <span
                    class="badge"
                    :class="`badge-${workflow.difficulty}`"
                  >
                    {{ workflow.difficulty }}
                  </span>
                  <span class="badge badge-primary">{{ workflow.category }}</span>
                </div>
              </div>
            </div>
          </router-link>
        </div>

        <div
          v-else
          class="no-results"
        >
          <p>No featured workflows available</p>
        </div>

        <div class="text-center mt-4">
          <router-link
            to="/workflows"
            class="btn btn-primary"
          >
            View All Workflows
          </router-link>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <h2 class="section-title">
          Why Use This Library?
        </h2>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              01
            </div>
            <h3>Searchable</h3>
            <p>Find workflows quickly with powerful search and filters</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              02
            </div>
            <h3>Visual Preview</h3>
            <p>See workflow structure before downloading</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              03
            </div>
            <h3>Easy Import</h3>
            <p>Download JSON and import directly into n8n</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              04
            </div>
            <h3>Organized</h3>
            <p>Browse by category, difficulty, and tags</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiClient } from '@utils/api';
import type { Workflow } from '@app-types/index';

const featuredWorkflows = ref<Workflow[]>([]);
const loading = ref(true);

function truncate(text: string, length: number): string {
  return text.length > length ? text.substring(0, length) + '...' : text;
}

onMounted(async () => {
  try {
    const response = await apiClient.getFeaturedWorkflows();
    featuredWorkflows.value = response.data;
  } catch (error) {
    console.error('Error loading featured workflows:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.home-page {
  width: 100%;
}

.hero {
  border: 1px solid #232323;
  border-radius: 20px;
  background: linear-gradient(140deg, #0d0d0d 0%, #050505 100%);
  padding: 4.25rem 2rem;
  text-align: left;
  margin-bottom: 2rem;
}

.hero-content {
  max-width: 760px;
  margin: 0 auto;
}

.hero-title {
  font-size: clamp(2.1rem, 5vw, 4rem);
  margin-bottom: 0.9rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 1.05rem;
  margin-bottom: 1.8rem;
  color: #ababab;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.featured-section,
.features-section {
  padding: 2rem 0;
}

.section-title {
  text-align: left;
  font-size: 1.6rem;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  color: #9a9a9a;
  font-size: 0.95rem;
  margin-bottom: 1.4rem;
}

.workflows-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.workflow-card-link {
  text-decoration: none;
  color: inherit;
}

.workflow-card {
  background: #0c0c0c;
  border-radius: 14px;
  border: 1px solid #242424;
  overflow: hidden;
  transition: transform 180ms ease, border-color 180ms ease;
}

.workflow-card:hover {
  transform: translateY(-2px);
  border-color: #3a3a3a;
}

.card-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-placeholder {
  width: 100%;
  height: 180px;
  background: #121212;
  color: #d7d7d7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  border-bottom: 1px solid #202020;
}

.card-content {
  padding: 1.5rem;
}

.card-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.25rem;
  line-height: 1.3;
}

.card-description {
  margin: 0 0 1rem 0;
  color: #a4a4a4;
  font-size: 0.9rem;
  line-height: 1.5;
}

.card-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  text-align: left;
  padding: 1.2rem;
  background: #0d0d0d;
  border-radius: 14px;
  border: 1px solid #232323;
  transition: border-color 180ms ease, transform 180ms ease;
}

.feature-card:hover {
  transform: translateY(-2px);
  border-color: #3a3a3a;
}

.feature-icon {
  font-size: 0.9rem;
  font-family: 'JetBrains Mono', monospace;
  color: #b7b7b7;
  margin-bottom: 0.8rem;
}

.feature-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

.feature-card p {
  margin: 0;
  color: #a2a2a2;
  font-size: 0.9rem;
}

.loading,
.no-results {
  text-align: center;
  padding: 3rem;
}

@media (max-width: 768px) {
  .hero {
    padding: 3rem 1rem;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .workflows-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 2rem;
  }
}
</style>

