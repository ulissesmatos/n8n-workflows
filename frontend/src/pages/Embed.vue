<template>
  <div
    class="embed"
    :class="{ 'embed-canvas-only': isCanvasOnly }"
  >
    <div
      v-if="loading"
      class="loading"
    >
      Loading workflow...
    </div>
    
    <div
      v-else-if="error"
      class="error"
    >
      {{ error }}
    </div>
    
    <div
      v-else-if="workflow"
      class="workflow-embed"
    >
      <WorkflowCanvas
        v-if="isCanvasOnly && workflow.jsonData"
        :workflow="workflow"
        :height="canvasHeight"
        :interactive="true"
        :click-to-interact="false"
      />

      <template v-else>
      <div class="embed-header">
        <h2>{{ workflow.title }}</h2>
        <span class="badge">{{ workflow.category }}</span>
      </div>

      <p class="description">
        {{ workflow.description }}
      </p>

      <WorkflowCanvas
        v-if="workflow.jsonData"
        :workflow="workflow"
        :height="canvasHeight"
        :interactive="true"
        :click-to-interact="false"
      />

      <div class="embed-actions">
        <a
          :href="viewUrl"
          target="_blank"
          class="btn btn-primary"
        >
          View Full Details
        </a>
        <button
          class="btn btn-secondary"
          @click="downloadWorkflow"
        >
          Download JSON
        </button>
      </div>

      <div class="embed-footer">
        <p>
          Powered by <a
            href="/"
            target="_blank"
          >n8n Workflow Library</a>
        </p>
      </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { apiClient } from '@utils/api';
import WorkflowCanvas from '@components/WorkflowCanvas.vue';
import type { Workflow } from '@/types';

const route = useRoute();
const workflow = ref<Workflow | null>(null);
const loading = ref(true);
const error = ref('');

const slug = computed(() => route.params.slug as string);
const viewUrl = computed(() => `${window.location.origin}/workflows/${slug.value}`);
const isCanvasOnly = computed(() => {
  const mode = String(route.query.mode || '').toLowerCase();
  return mode === 'canvas' || mode === 'canvas-only' || mode === 'only-canvas' || route.query.canvasOnly === '1';
});
const canvasHeight = computed(() => {
  const value = Number(route.query.height || 680);
  if (!Number.isFinite(value)) return 680;
  return Math.max(320, Math.round(value));
});

async function loadWorkflow() {
  try {
    const response = await apiClient.getWorkflowBySlug(slug.value);
    workflow.value = response.data;
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to load workflow';
  } finally {
    loading.value = false;
  }
}

async function downloadWorkflow() {
  if (!workflow.value) return;

  try {
    await apiClient.downloadWorkflow(workflow.value.slug);
  } catch (err) {
    console.error('Download failed:', err);
  }
}

onMounted(() => {
  loadWorkflow();
});
</script>

<style scoped>
.embed {
  padding: 1rem;
  border: 1px solid #242424;
  border-radius: 14px;
  background: #0a0a0a;
}

.embed.embed-canvas-only {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
  color: #afafaf;
}

.error {
  color: #ffb8b8;
}

.embed-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.embed-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #f1f1f1;
}

.badge {
  padding: 0.25rem 0.75rem;
  background: #f0f0f0;
  color: #0e0e0e;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.description {
  color: #a4a4a4;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.embed-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.embed-footer {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #1f1f1f;
  text-align: center;
  font-size: 0.875rem;
  color: #9e9e9e;
}

.embed-footer a {
  color: #e8e8e8;
  text-decoration: none;
}

.embed-footer a:hover {
  text-decoration: underline;
}
</style>

