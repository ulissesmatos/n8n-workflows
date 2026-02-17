import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { apiClient } from '@utils/api';
import type { Workflow, WorkflowFilters } from '@app-types';

export const useWorkflowStore = defineStore('workflows', () => {
  // State
  const workflows = ref<Workflow[]>([]);
  const currentWorkflow = ref<Workflow | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Filters state
  const filters = ref<WorkflowFilters>({
    search: '',
    category: undefined,
    difficulty: undefined,
    tags: [],
    sort: 'newest',
    page: 1,
    limit: 20,
  });

  // Computed properties
  const hasWorkflows = computed(() => workflows.value.length > 0);
  const isFiltering = computed(
    () =>
      filters.value.search ||
      filters.value.category ||
      filters.value.difficulty ||
      (filters.value.tags && filters.value.tags.length > 0)
  );

  // Actions
  async function fetchWorkflows(newFilters?: Partial<WorkflowFilters>) {
    try {
      loading.value = true;
      error.value = null;

      // Merge filters
      if (newFilters) {
        filters.value = { ...filters.value, ...newFilters, page: newFilters.page || 1 };
      }

      const response = await apiClient.getWorkflows(filters.value);
      workflows.value = response.data;
      pagination.value = response.pagination;
    } catch (err: any) {
      error.value = err?.message || 'Failed to fetch workflows';
      console.error('Error fetching workflows:', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchWorkflowBySlug(slug: string) {
    try {
      loading.value = true;
      error.value = null;

      const response = await apiClient.getWorkflowBySlug(slug);
      currentWorkflow.value = response.data;
    } catch (err: any) {
      error.value = err?.message || 'Failed to fetch workflow';
      console.error('Error fetching workflow:', err);
    } finally {
      loading.value = false;
    }
  }

  async function downloadWorkflow(slug: string) {
    try {
      await apiClient.downloadWorkflow(slug);
    } catch (err: any) {
      error.value = err?.message || 'Failed to download workflow';
      console.error('Error downloading workflow:', err);
    }
  }

  function setFilters(newFilters: Partial<WorkflowFilters>) {
    filters.value = { ...filters.value, ...newFilters, page: 1 };
  }

  function clearFilters() {
    filters.value = {
      search: '',
      category: undefined,
      difficulty: undefined,
      tags: [],
      sort: 'newest',
      page: 1,
      limit: 20,
    };
  }

  function goToPage(page: number) {
    filters.value.page = page;
  }

  return {
    // State
    workflows,
    currentWorkflow,
    loading,
    error,
    pagination,
    filters,

    // Computed
    hasWorkflows,
    isFiltering,

    // Actions
    fetchWorkflows,
    fetchWorkflowBySlug,
    downloadWorkflow,
    setFilters,
    clearFilters,
    goToPage,
  };
});

