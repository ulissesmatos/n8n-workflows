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
      class="workflows-table"
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
</style>

