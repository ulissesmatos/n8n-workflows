<template>
  <div class="admin-dashboard">
    <h1>Dashboard</h1>
    <p class="subtitle">
      Welcome to the workflow management dashboard
    </p>

    <div
      v-if="loading"
      class="loading"
    >
      <div class="spinner" />
    </div>

    <div
      v-else
      class="stats-grid"
    >
      <div class="stat-card">
        <h3>Total Workflows</h3>
        <p class="stat-value">
          {{ stats.totalWorkflows }}
        </p>
      </div>
      <div class="stat-card">
        <h3>Published</h3>
        <p class="stat-value">
          {{ stats.publishedWorkflows }}
        </p>
      </div>
      <div class="stat-card">
        <h3>Total Views</h3>
        <p class="stat-value">
          {{ stats.totalViews }}
        </p>
      </div>
      <div class="stat-card">
        <h3>Total Downloads</h3>
        <p class="stat-value">
          {{ stats.totalDownloads }}
        </p>
      </div>
    </div>

    <div class="quick-actions">
      <h2>Quick Actions</h2>
      <router-link
        to="/admin/workflows/new"
        class="btn btn-primary"
      >
        Create New Workflow
      </router-link>
      <router-link
        to="/admin/workflows"
        class="btn btn-secondary"
      >
        Manage Workflows
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiClient } from '@utils/api';

const stats = ref({
  totalWorkflows: 0,
  publishedWorkflows: 0,
  totalViews: 0,
  totalDownloads: 0,
});
const loading = ref(true);

onMounted(async () => {
  try {
    const response = await apiClient.getAdminStats();
    stats.value = response.data;
  } catch (error) {
    console.error('Error loading stats:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.admin-dashboard {
  max-width: 1200px;
}

h1 {
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #a7a7a7;
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: #0c0c0c;
  padding: 1.2rem;
  border-radius: 14px;
  border: 1px solid #242424;
}

.stat-card h3 {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  color: #9e9e9e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  margin: 0;
  font-size: 2.2rem;
  font-weight: 700;
  color: #f6f6f6;
}

.quick-actions {
  background: #0c0c0c;
  padding: 1.2rem;
  border-radius: 14px;
  border: 1px solid #242424;
}

.quick-actions h2 {
  margin-bottom: 1.5rem;
}

.quick-actions .btn {
  margin-right: 1rem;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  h1 {
    font-size: 1.4rem;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
  }

  .stat-card {
    padding: 0.9rem;
  }

  .stat-card h3 {
    font-size: 0.7rem;
    margin-bottom: 0.5rem;
  }

  .stat-value {
    font-size: 1.6rem;
  }

  .quick-actions {
    padding: 1rem;
  }

  .quick-actions h2 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }

  .quick-actions .btn {
    display: block;
    width: 100%;
    margin-right: 0;
    margin-bottom: 0.6rem;
    text-align: center;
  }
}
</style>
