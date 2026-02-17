<template>
  <div class="workflow-detail-page">
    <div
      v-if="loading"
      class="loading"
    >
      <div class="spinner" />
      <p>Loading workflow...</p>
    </div>

    <div
      v-else-if="error"
      class="alert alert-error"
    >
      {{ error }}
      <router-link
        to="/workflows"
        class="btn btn-secondary mt-2"
      >
        Back to Workflows
      </router-link>
    </div>

    <div
      v-else-if="workflow"
      class="workflow-detail"
    >
      <!-- Header -->
      <div class="workflow-header">
        <h1 class="workflow-title">
          {{ workflow.title }}
        </h1>
        <p class="workflow-description">
          {{ workflow.description }}
        </p>

        <div class="workflow-meta">
          <span
            class="badge"
            :class="`badge-${workflow.difficulty}`"
          >
            {{ workflow.difficulty }}
          </span>
          <span class="badge badge-primary">{{ workflow.category }}</span>
          <span class="meta-item">{{ workflow.viewCount }} views</span>
          <span
            v-if="workflow.rating"
            class="meta-item"
          >Rating {{ workflow.rating }}</span>
        </div>

        <div
          v-if="workflow.tags && workflow.tags.length"
          class="workflow-tags"
        >
          <span
            v-for="tag in workflow.tags"
            :key="tag"
            class="tag"
          >
            {{ tag }}
          </span>
        </div>

        <div class="workflow-actions">
          <button
            class="btn btn-primary"
            @click="downloadWorkflow"
          >
            Download JSON
          </button>
          <button
            class="btn btn-secondary"
            @click="copyLink"
          >
            Copy Link
          </button>
        </div>
      </div>

      <!-- Canvas Preview -->
      <div class="workflow-canvas-section">
        <h2>Workflow Preview</h2>
        <WorkflowCanvas
          :workflow="workflow"
          :interactive="true"
        />
      </div>

      <!-- Content/Description -->
      <div
        v-if="workflow.content"
        class="workflow-content"
      >
        <h2>How to Use</h2>
        <div
          class="content-html"
          v-html="workflow.content"
        />
      </div>

      <!-- Details -->
      <div class="workflow-details">
        <h2>Details</h2>
        <div class="details-grid">
          <div class="detail-item">
            <strong>Author:</strong> {{ workflow.author }}
          </div>
          <div class="detail-item">
            <strong>Version:</strong> {{ workflow.version }}
          </div>
          <div class="detail-item">
            <strong>Created:</strong> {{ formatDate(workflow.createdAt) }}
          </div>
          <div class="detail-item">
            <strong>Updated:</strong> {{ formatDate(workflow.updatedAt) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useWorkflowStore } from '@stores/workflows';
import WorkflowCanvas from '@components/WorkflowCanvas.vue';

const route = useRoute();
const workflowStore = useWorkflowStore();

const slug = route.params.slug as string;
const workflow = ref(workflowStore.currentWorkflow);
const loading = ref(true);
const error = ref<string | null>(null);

async function downloadWorkflow() {
  try {
    await workflowStore.downloadWorkflow(slug);
  } catch (err: any) {
    alert('Failed to download workflow');
  }
}

function copyLink() {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    alert('Link copied to clipboard!');
  });
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

onMounted(async () => {
  loading.value = true;
  error.value = null;

  try {
    await workflowStore.fetchWorkflowBySlug(slug);
    workflow.value = workflowStore.currentWorkflow;
    
    if (!workflow.value) {
      error.value = 'Workflow not found';
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load workflow';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.workflow-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 0 2rem;
}

.loading {
  text-align: center;
  padding: 4rem;
}

.workflow-header {
  margin-bottom: 2rem;
  padding: 1.2rem;
  border: 1px solid #232323;
  border-radius: 16px;
  background: #0b0b0b;
}

.workflow-title {
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  margin-bottom: 1rem;
}

.workflow-description {
  font-size: 1rem;
  color: #a8a8a8;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.workflow-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.meta-item {
  font-size: 0.9rem;
  color: #b1b1b1;
}

.workflow-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.tag {
  padding: 0.5rem 1rem;
  background: #141414;
  color: #d0d0d0;
  border: 1px solid #292929;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.workflow-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.workflow-canvas-section,
.workflow-content,
.workflow-details {
  margin-bottom: 2rem;
  padding: 1.2rem;
  border: 1px solid #232323;
  border-radius: 16px;
  background: #0b0b0b;
}

.workflow-canvas-section h2,
.workflow-content h2,
.workflow-details h2 {
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
}

.content-html {
  line-height: 1.8;
  color: #d0d0d0;
}

.content-html h2 {
  font-size: 1.5rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.content-html p {
  margin-bottom: 1rem;
}

.content-html code {
  background: #161616;
  border: 1px solid #2b2b2b;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
}

.content-html pre {
  background: #141414;
  border: 1px solid #252525;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.detail-item {
  font-size: 0.95rem;
}

.detail-item strong {
  display: block;
  color: #a1a1a1;
  margin-bottom: 0.25rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .workflow-detail-page {
    padding: 1rem;
  }

  .workflow-title {
    font-size: 1.75rem;
  }

  .workflow-description {
    font-size: 1rem;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
