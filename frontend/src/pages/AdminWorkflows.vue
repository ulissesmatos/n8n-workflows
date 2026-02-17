<template>
  <div class="admin-workflows">
    <div class="page-header">
      <h1>Manage Workflows</h1>
      <router-link
        to="/admin/workflows/new"
        class="btn btn-primary"
      >
        Create New
      </router-link>
    </div>

    <div
      v-if="loading"
      class="loading"
    >
      <div class="spinner" />
    </div>

    <div
      v-else-if="workflows.length === 0"
      class="no-results"
    >
      <p>No workflows yet. Create your first one!</p>
    </div>

    <table
      v-else
      class="workflows-table desktop-only"
    >
      <thead>
        <tr>
          <th>Title</th>
          <th>Status</th>
          <th>Views</th>
          <th>Downloads</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="workflow in workflows"
          :key="workflow.id"
        >
          <td>{{ workflow.title }}</td>
          <td>
            <span
              :class="workflow.isPublished ? 'badge-success' : 'badge-warning'"
              class="badge"
            >
              {{ workflow.isPublished ? 'Published' : 'Draft' }}
            </span>
          </td>
          <td>{{ workflow.viewCount }}</td>
          <td>{{ workflow.downloadCount }}</td>
          <td class="actions">
            <router-link
              :to="`/admin/workflows/${workflow.id}/edit`"
              class="btn btn-small"
            >
              Edit
            </router-link>
            <button
              class="btn btn-danger btn-small"
              @click="deleteWorkflow(workflow.id)"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Mobile workflow cards -->
    <div v-if="workflows.length > 0" class="mobile-only wf-cards">
      <div v-for="wf in workflows" :key="'m-' + wf.id" class="wf-card">
        <div class="wf-card-top">
          <div class="wf-card-info">
            <span class="wf-card-title">{{ wf.title }}</span>
            <span :class="wf.isPublished ? 'badge-success' : 'badge-warning'" class="badge">
              {{ wf.isPublished ? 'Published' : 'Draft' }}
            </span>
          </div>
        </div>
        <div class="wf-card-stats">
          <span>👁 {{ wf.viewCount }}</span>
          <span>⬇ {{ wf.downloadCount }}</span>
        </div>
        <div class="wf-card-actions">
          <router-link :to="`/admin/workflows/${wf.id}/edit`" class="btn btn-small">Edit</router-link>
          <button class="btn btn-danger btn-small" @click="deleteWorkflow(wf.id)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiClient } from '@utils/api';
import type { Workflow } from '@app-types/index';

const workflows = ref<Workflow[]>([]);
const loading = ref(true);

async function loadWorkflows() {
  try {
    loading.value = true;
    const response = await apiClient.getAdminWorkflows();
    workflows.value = response.data;
  } catch (error) {
    console.error('Error loading workflows:', error);
  } finally {
    loading.value = false;
  }
}

async function deleteWorkflow(id: string) {
  if (!confirm('Are you sure you want to delete this workflow?')) return;

  try {
    await apiClient.deleteWorkflow(id);
    await loadWorkflows();
  } catch (error) {
    alert('Failed to delete workflow');
  }
}

onMounted(() => {
  loadWorkflows();
});
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.2rem;
}

.workflows-table {
  width: 100%;
  background: #0c0c0c;
  border-radius: 14px;
  border: 1px solid #242424;
  overflow: hidden;
}

.workflows-table th,
.workflows-table td {
  padding: 1rem;
  text-align: left;
}

.workflows-table thead {
  background: #121212;
  font-weight: 600;
}

.workflows-table tbody tr {
  border-top: 1px solid #1f1f1f;
}

.workflows-table tbody tr:hover {
  background: #121212;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

/* Mobile card list (hidden on desktop) */
.mobile-only {
  display: none;
}

.wf-cards {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.wf-card {
  background: #0c0c0c;
  border: 1px solid #242424;
  border-radius: 12px;
  padding: 0.9rem;
}

.wf-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.wf-card-info {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.wf-card-title {
  font-weight: 600;
  color: #f2f2f2;
  font-size: 0.95rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wf-card-stats {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  color: #777;
  font-size: 0.8rem;
}

.wf-card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.7rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }

  .page-header h1 {
    font-size: 1.3rem;
    margin: 0;
  }

  .page-header .btn {
    text-align: center;
  }

  .desktop-only {
    display: none !important;
  }

  .mobile-only {
    display: flex;
  }

  .no-results {
    padding: 2rem 1rem;
  }
}
</style>

