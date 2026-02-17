<template>
  <div class="admin-categories">
    <div class="page-header">
      <div>
        <h1>Categories</h1>
        <p class="subtitle">Manage workflow categories. Changes sync to all frontends.</p>
      </div>
      <button class="btn btn-primary" @click="openCreateModal">+ New Category</button>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner" />
    </div>

    <div v-else>
      <div v-if="categories.length === 0" class="empty-state">
        <p>No categories yet. Create your first one!</p>
      </div>

      <table v-else class="categories-table desktop-only">
        <thead>
          <tr>
            <th>Icon</th>
            <th>Name</th>
            <th>Slug</th>
            <th>Description</th>
            <th>Workflows</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in categories" :key="cat.id">
            <td class="icon-cell">{{ cat.icon || '—' }}</td>
            <td class="name-cell">{{ cat.name }}</td>
            <td class="slug-cell"><code>{{ cat.slug }}</code></td>
            <td class="desc-cell">{{ cat.description || '—' }}</td>
            <td class="count-cell">{{ cat.workflowCount ?? 0 }}</td>
            <td class="actions-cell">
              <button class="btn-icon" title="Edit" @click="openEditModal(cat)">✏️</button>
              <button class="btn-icon btn-danger" title="Delete" @click="confirmDelete(cat)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Mobile card list -->
      <div v-if="categories.length > 0" class="mobile-only category-cards">
        <div v-for="cat in categories" :key="'m-' + cat.id" class="category-card">
          <div class="category-card-header">
            <span class="category-card-icon">{{ cat.icon || '📁' }}</span>
            <div class="category-card-info">
              <span class="category-card-name">{{ cat.name }}</span>
              <span class="category-card-slug">{{ cat.slug }}</span>
            </div>
            <span class="category-card-count">{{ cat.workflowCount ?? 0 }}</span>
          </div>
          <p v-if="cat.description" class="category-card-desc">{{ cat.description }}</p>
          <div class="category-card-actions">
            <button class="btn btn-sm btn-secondary" @click="openEditModal(cat)">Edit</button>
            <button class="btn btn-sm btn-danger" @click="confirmDelete(cat)">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h2>{{ editingCategory ? 'Edit Category' : 'New Category' }}</h2>
        <form @submit.prevent="saveCategory">
          <div class="form-group">
            <label for="cat-name">Name *</label>
            <input
              id="cat-name"
              v-model="form.name"
              type="text"
              required
              placeholder="e.g. Marketing"
              @input="autoSlug"
            />
          </div>
          <div class="form-group">
            <label for="cat-slug">Slug *</label>
            <input
              id="cat-slug"
              v-model="form.slug"
              type="text"
              required
              placeholder="e.g. marketing"
              pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
            />
          </div>
          <div class="form-group">
            <label for="cat-icon">Icon (emoji)</label>
            <input
              id="cat-icon"
              v-model="form.icon"
              type="text"
              placeholder="e.g. 📧"
              maxlength="10"
            />
          </div>
          <div class="form-group">
            <label for="cat-desc">Description</label>
            <textarea
              id="cat-desc"
              v-model="form.description"
              rows="3"
              placeholder="Short description of this category..."
            />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving...' : (editingCategory ? 'Update' : 'Create') }}
            </button>
          </div>
          <p v-if="formError" class="form-error">{{ formError }}</p>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal modal-sm">
        <h2>Delete Category</h2>
        <p>Are you sure you want to delete <strong>{{ deletingCategory?.name }}</strong>?</p>
        <p v-if="(deletingCategory?.workflowCount ?? 0) > 0" class="form-error">
          ⚠️ {{ deletingCategory?.workflowCount }} workflow(s) use this category. They won't be deleted but their category field will become orphaned.
        </p>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showDeleteModal = false">Cancel</button>
          <button class="btn btn-danger" :disabled="deleting" @click="doDelete">
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiClient } from '@utils/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  workflowCount?: number;
  createdAt: string;
  updatedAt: string;
}

const categories = ref<Category[]>([]);
const loading = ref(true);
const showModal = ref(false);
const showDeleteModal = ref(false);
const editingCategory = ref<Category | null>(null);
const deletingCategory = ref<Category | null>(null);
const saving = ref(false);
const deleting = ref(false);
const formError = ref('');

const form = ref({
  name: '',
  slug: '',
  icon: '',
  description: '',
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function autoSlug() {
  if (!editingCategory.value) {
    form.value.slug = slugify(form.value.name);
  }
}

async function fetchCategories() {
  loading.value = true;
  try {
    const response = await apiClient.getAdminCategories();
    categories.value = response.data;
  } catch (error) {
    console.error('Error loading categories:', error);
  } finally {
    loading.value = false;
  }
}

function openCreateModal() {
  editingCategory.value = null;
  form.value = { name: '', slug: '', icon: '', description: '' };
  formError.value = '';
  showModal.value = true;
}

function openEditModal(cat: Category) {
  editingCategory.value = cat;
  form.value = {
    name: cat.name,
    slug: cat.slug,
    icon: cat.icon || '',
    description: cat.description || '',
  };
  formError.value = '';
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingCategory.value = null;
  formError.value = '';
}

async function saveCategory() {
  saving.value = true;
  formError.value = '';
  try {
    const payload: any = {
      name: form.value.name,
      slug: form.value.slug,
    };
    if (form.value.icon) payload.icon = form.value.icon;
    if (form.value.description) payload.description = form.value.description;

    if (editingCategory.value) {
      await apiClient.updateCategory(editingCategory.value.id, payload);
    } else {
      await apiClient.createCategory(payload);
    }
    closeModal();
    await fetchCategories();
  } catch (error: any) {
    formError.value = error.response?.data?.message || error.message || 'Failed to save category';
  } finally {
    saving.value = false;
  }
}

function confirmDelete(cat: Category) {
  deletingCategory.value = cat;
  showDeleteModal.value = true;
}

async function doDelete() {
  if (!deletingCategory.value) return;
  deleting.value = true;
  try {
    await apiClient.deleteCategory(deletingCategory.value.id);
    showDeleteModal.value = false;
    deletingCategory.value = null;
    await fetchCategories();
  } catch (error: any) {
    console.error('Failed to delete:', error);
  } finally {
    deleting.value = false;
  }
}

onMounted(fetchCategories);
</script>

<style scoped>
.admin-categories {
  max-width: 1200px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin-bottom: 0.25rem;
}

.subtitle {
  color: #a7a7a7;
  margin: 0;
  font-size: 0.9rem;
}

.categories-table {
  width: 100%;
  border-collapse: collapse;
  background: #0c0c0c;
  border: 1px solid #242424;
  border-radius: 12px;
  overflow: hidden;
}

.categories-table th,
.categories-table td {
  padding: 0.85rem 1rem;
  text-align: left;
  border-bottom: 1px solid #1a1a1a;
}

.categories-table th {
  background: #111;
  color: #a7a7a7;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.categories-table tbody tr:hover {
  background: #131313;
}

.icon-cell {
  font-size: 1.3rem;
  width: 60px;
  text-align: center;
}

.name-cell {
  font-weight: 600;
  color: #f2f2f2;
}

.slug-cell code {
  font-size: 0.8rem;
  background: #1a1a1a;
  padding: 2px 6px;
  border-radius: 4px;
  color: #a7a7a7;
}

.desc-cell {
  color: #888;
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.count-cell {
  text-align: center;
  font-weight: 600;
  color: #6366f1;
}

.actions-cell {
  white-space: nowrap;
}

.btn {
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 150ms ease;
}

.btn-primary {
  background: #6366f1;
  color: #fff;
}

.btn-primary:hover {
  background: #5457e5;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #242424;
  color: #e0e0e0;
}

.btn-secondary:hover {
  background: #333;
}

.btn-danger {
  background: #dc2626;
  color: #fff;
}

.btn-danger:hover {
  background: #b91c1c;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 1rem;
  border-radius: 6px;
  transition: background 150ms;
}

.btn-icon:hover {
  background: #242424;
}

.btn-icon.btn-danger:hover {
  background: #2a0a0a;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #888;
  background: #0c0c0c;
  border: 1px solid #242424;
  border-radius: 12px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #111;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 2rem;
  width: 480px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-sm {
  width: 400px;
}

.modal h2 {
  margin: 0 0 1.5rem;
  font-size: 1.2rem;
  color: #f2f2f2;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.85rem;
  color: #a7a7a7;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.6rem 0.8rem;
  background: #0c0c0c;
  border: 1px solid #333;
  border-radius: 8px;
  color: #f2f2f2;
  font-size: 0.9rem;
  font-family: inherit;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #6366f1;
}

.modal-actions {
  display: flex;
  gap: 0.8rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.form-error {
  color: #f87171;
  font-size: 0.85rem;
  margin-top: 0.8rem;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #333;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Mobile card list (hidden on desktop) */
.mobile-only {
  display: none;
}

.category-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-card {
  background: #0c0c0c;
  border: 1px solid #242424;
  border-radius: 12px;
  padding: 1rem;
}

.category-card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.category-card-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.category-card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.category-card-name {
  font-weight: 600;
  color: #f2f2f2;
  font-size: 0.95rem;
}

.category-card-slug {
  font-size: 0.75rem;
  color: #666;
}

.category-card-count {
  font-weight: 700;
  color: #6366f1;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.category-card-desc {
  margin: 0.6rem 0 0;
  color: #888;
  font-size: 0.85rem;
  line-height: 1.4;
}

.category-card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.btn-sm {
  padding: 0.4rem 0.9rem;
  font-size: 0.8rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

@media (max-width: 768px) {
  .admin-categories {
    padding: 0;
  }

  .page-header {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
    margin-bottom: 1.25rem;
  }

  .page-header h1 {
    font-size: 1.3rem;
    margin: 0;
  }

  .page-header .btn {
    width: 100%;
  }

  /* Hide desktop table, show mobile cards */
  .desktop-only {
    display: none !important;
  }

  .mobile-only {
    display: flex;
  }

  .modal {
    width: calc(100vw - 2rem);
    max-height: calc(100vh - 2rem);
    max-height: calc(100dvh - 2rem);
    padding: 1.25rem;
    border-radius: 14px;
  }

  .modal h2 {
    font-size: 1.1rem;
  }

  .modal-actions {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }

  .modal-actions .btn {
    width: 100%;
  }

  .modal-sm {
    width: calc(100vw - 2rem);
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
