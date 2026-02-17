<template>
  <div class="workflows-page">
    <div class="page-header">
      <h1>Explore Workflows</h1>
      <p class="subtitle">
        Browse and discover n8n automation workflows
      </p>
    </div>

    <div class="page-content">
      <!-- Filters & Search -->
      <aside class="filters-sidebar">
        <div class="filter-section">
          <h3>Search</h3>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search workflows..."
            class="search-input"
            @input="applyFilters"
          >
        </div>

        <div class="filter-section">
          <h3>Difficulty</h3>
          <div class="filter-options">
            <label
              v-for="level in ['easy', 'medium', 'hard']"
              :key="level"
            >
              <input
                v-model="selectedDifficulty"
                type="radio"
                :value="level"
                @change="applyFilters"
              >
              <span
                class="capitalize badge"
                :class="`badge-${level}`"
              > {{ level }} </span>
            </label>
          </div>
        </div>

        <div class="filter-section">
          <h3>Category</h3>
          <select
            v-model="selectedCategory"
            class="filter-select"
            @change="applyFilters"
          >
            <option value="">
              All Categories
            </option>
            <option value="Integration">
              Integration
            </option>
            <option value="Automation">
              Automation
            </option>
            <option value="Data">
              Data Processing
            </option>
            <option value="Webhook">
              Webhook
            </option>
          </select>
        </div>

        <div class="filter-section">
          <h3>Sort By</h3>
          <select
            v-model="sortBy"
            class="filter-select"
            @change="applyFilters"
          >
            <option value="newest">
              Newest
            </option>
            <option value="popular">
              Most Popular
            </option>
            <option value="rating">
              Highest Rated
            </option>
          </select>
        </div>

        <button
          v-if="hasFilters"
          class="btn btn-secondary btn-block"
          @click="clearAllFilters"
        >
          Clear Filters
        </button>
      </aside>

      <!-- Workflows Grid -->
      <div class="workflows-main">
        <!-- Loading state -->
        <div
          v-if="workflowStore.loading"
          class="loading"
        >
          <div class="spinner" />
          <p>Loading workflows...</p>
        </div>

        <!-- Error state -->
        <div
          v-else-if="workflowStore.error"
          class="alert alert-error"
        >
          {{ workflowStore.error }}
          <button
            class="btn btn-small mt-2"
            @click="retryLoad"
          >
            Retry
          </button>
        </div>

        <!-- Empty state -->
        <div
          v-else-if="!workflowStore.hasWorkflows"
          class="no-results"
        >
          <p>No workflows found matching your criteria.</p>
          <button
            class="btn btn-primary"
            @click="clearAllFilters"
          >
            Reset Filters
          </button>
        </div>

        <!-- Workflows grid -->
        <div
          v-else
          class="workflows-grid"
        >
          <router-link
            v-for="workflow in workflowStore.workflows"
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
                <span>No Image</span>
              </div>

              <div class="card-content">
                <h3 class="card-title">
                  {{ workflow.title }}
                </h3>

                <p class="card-description">
                  {{ truncate(workflow.description, 150) }}
                </p>

                <div class="card-meta">
                  <span
                    class="difficulty"
                    :class="`difficulty-${workflow.difficulty}`"
                  >
                    {{ workflow.difficulty }}
                  </span>
                  <span class="category">{{ workflow.category }}</span>
                </div>

                <div
                  v-if="workflow.tags && workflow.tags.length"
                  class="card-tags"
                >
                  <span
                    v-for="tag in workflow.tags.slice(0, 3)"
                    :key="tag"
                    class="tag"
                  >
                    {{ tag }}
                  </span>
                  <span
                    v-if="workflow.tags.length > 3"
                    class="tag-more"
                  >
                    +{{ workflow.tags.length - 3 }}
                  </span>
                </div>

                <div class="card-footer">
                  <span class="views">{{ workflow.viewCount }} views</span>
                  <span
                    v-if="workflow.rating"
                    class="rating"
                  >Rating {{ workflow.rating }}</span>
                </div>
              </div>
            </div>
          </router-link>
        </div>

        <!-- Pagination -->
        <div
          v-if="workflowStore.pagination.totalPages > 1"
          class="pagination"
        >
          <button
            :disabled="!workflowStore.pagination.hasPrev"
            class="btn btn-secondary"
            @click="goToPage(workflowStore.pagination.page - 1)"
          >
            Previous
          </button>

          <div class="page-numbers">
            <button
              v-for="page in getPageNumbers()"
              :key="page"
              :class="{ active: page === workflowStore.pagination.page }"
              class="page-btn"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </div>

          <button
            :disabled="!workflowStore.pagination.hasNext"
            class="btn btn-secondary"
            @click="goToPage(workflowStore.pagination.page + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useWorkflowStore } from '@stores/workflows';
import type { WorkflowFilters } from '@app-types/index';

const workflowStore = useWorkflowStore();

const searchQuery = ref('');
const selectedCategory = ref('');
const selectedDifficulty = ref('');
const sortBy = ref('newest');

const hasFilters = computed(
  () => searchQuery.value || selectedCategory.value || selectedDifficulty.value
);

function truncate(text: string, length: number) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  return normalized.length > length ? normalized.substring(0, length).trimEnd() + '...' : normalized;
}

function applyFilters() {
  const filters: WorkflowFilters = {
    search: searchQuery.value || undefined,
    category: selectedCategory.value || undefined,
    difficulty: (selectedDifficulty.value as any) || undefined,
    sort: (sortBy.value as any) || 'newest',
    page: 1,
  };

  workflowStore.fetchWorkflows(filters);
}

function clearAllFilters() {
  searchQuery.value = '';
  selectedCategory.value = '';
  selectedDifficulty.value = '';
  sortBy.value = 'newest';
  workflowStore.clearFilters();
  workflowStore.fetchWorkflows();
}

function retryLoad() {
  workflowStore.fetchWorkflows();
}

function goToPage(page: number) {
  workflowStore.goToPage(page);
  applyFilters();
}

function getPageNumbers() {
  const total = workflowStore.pagination.totalPages;
  const current = workflowStore.pagination.page;
  const range = 2;

  const pages = [];
  for (let i = Math.max(1, current - range); i <= Math.min(total, current + range); i++) {
    pages.push(i);
  }

  return pages;
}

onMounted(() => {
  workflowStore.fetchWorkflows();
});
</script>

<style scoped>
.workflows-page {
  padding: 1rem 0 2rem;
}

.page-header {
  margin-bottom: 1.6rem;
}

.page-header h1 {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 0.98rem;
  color: #a2a2a2;
  margin-bottom: 0;
}

.page-content {
  display: grid;
  grid-template-columns: 270px 1fr;
  gap: 1rem;
}

.filters-sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.filter-section {
  background: #0c0c0c;
  padding: 1.1rem;
  border-radius: 14px;
  border: 1px solid #222;
}

.filter-section h3 {
  margin: 0 0 1rem 0;
  font-size: 0.95rem;
}

.search-input {
  width: 100%;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-options label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}

.filter-options input {
  width: auto;
}

.filter-select {
  width: 100%;
}

.btn-block {
  width: 100%;
}

.capitalize {
  text-transform: capitalize;
}

.badge-easy {
  background: #17351d;
  border-color: #285a31;
  color: #9cdca8;
}

.badge-medium {
  background: #372d18;
  border-color: #5d4a26;
  color: #ffda93;
}

.badge-hard {
  background: #331919;
  border-color: #5a2a2a;
  color: #ffb4b4;
}

.workflows-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.loading,
.no-results {
  text-align: center;
  padding: 3rem;
  background: #0d0d0d;
  border-radius: 14px;
  border: 1px solid #222;
}

.workflows-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.workflow-card-link {
  text-decoration: none;
  color: inherit;
}

.workflow-card {
  background: #0d0d0d;
  border-radius: 14px;
  border: 1px solid #222;
  overflow: hidden;
  transition: border-color 180ms ease, transform 180ms ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.workflow-card:hover {
  border-color: #393939;
  transform: translateY(-2px);
}

.card-image {
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: #121212;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-placeholder {
  width: 100%;
  height: 160px;
  background: #121212;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b9b9b9;
  font-weight: 600;
  border-bottom: 1px solid #202020;
}

.card-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.125rem;
  line-height: 1.3;
}

.card-description {
  margin: 0 0 1rem 0;
  color: #9f9f9f;
  font-size: 0.875rem;
  line-height: 1.4;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.difficulty,
.category {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 600;
}

.difficulty {
  background: #141414;
  color: #d9d9d9;
  border: 1px solid #2c2c2c;
}

.difficulty-easy {
  background: #17351d;
  color: #9cdca8;
}

.difficulty-medium {
  background: #372d18;
  color: #ffd48d;
}

.difficulty-hard {
  background: #331919;
  color: #ffb3b3;
}

.category {
  background: #f1f1f1;
  color: #111;
}

.card-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.tag,
.tag-more {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: #141414;
  border: 1px solid #242424;
  border-radius: 4px;
  color: #adadad;
}

.card-footer {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #9a9a9a;
  border-top: 1px solid #1f1f1f;
  padding-top: 1rem;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.2rem;
  background: #0d0d0d;
  border: 1px solid #222;
  border-radius: 14px;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #2b2b2b;
  border-radius: 10px;
  background: #121212;
  color: #d0d0d0;
  cursor: pointer;
  font-weight: 600;
  transition: border-color 180ms ease, background-color 180ms ease;
}

.page-btn:hover {
  border-color: #4a4a4a;
  color: #fff;
}

.page-btn.active {
  background: #f0f0f0;
  color: #121212;
  border-color: #f0f0f0;
}

@media (max-width: 1024px) {
  .page-content {
    grid-template-columns: 1fr;
  }

  .filters-sidebar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .workflows-grid {
    grid-template-columns: 1fr;
  }

  .filter-section {
    padding: 1rem;
  }

  .page-header h1 {
    font-size: 1.75rem;
  }
}
</style>

