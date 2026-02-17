<template>
  <div class="workflow-editor">
    <h1>{{ isNew ? 'Create Workflow' : 'Edit Workflow' }}</h1>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="title">Title *</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          required
        >
      </div>

      <div class="form-group">
        <label for="slug">Slug *</label>
        <input
          id="slug"
          v-model="form.slug"
          type="text"
          required
        >
      </div>

      <div class="form-group">
        <label for="description">Short Description (Excerpt) *</label>
        <textarea
          id="description"
          v-model="form.description"
          required
          minlength="10"
          maxlength="260"
          rows="3"
        />
        <small class="field-hint">Used in cards/listing. Keep it concise (10-260 chars).</small>
      </div>

      <div class="form-group">
        <label for="content">Article Content (SEO)</label>
        <QuillEditor
          id="content"
          v-model:content="form.content"
          content-type="html"
          theme="snow"
          :toolbar="editorToolbar"
          class="rich-editor"
        />
        <small class="field-hint">This appears on the workflow detail page as formatted article content.</small>
      </div>

      <div class="form-group">
        <label for="category">Category *</label>
        <select
          id="category"
          v-model="form.category"
          required
        >
          <option value="">
            Select category
          </option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.name">
            {{ cat.icon ? cat.icon + ' ' : '' }}{{ cat.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="difficulty">Difficulty *</label>
        <select
          id="difficulty"
          v-model="form.difficulty"
          required
        >
          <option value="easy">
            Easy
          </option>
          <option value="medium">
            Medium
          </option>
          <option value="hard">
            Hard
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="tags">Tags (comma-separated)</label>
        <input
          id="tags"
          v-model="tagsString"
          type="text"
          placeholder="webhook, api, automation"
        >
      </div>

      <div class="form-group">
        <label for="jsonData">Workflow JSON *</label>
        <div class="json-upload-row">
          <input
            id="jsonFile"
            type="file"
            accept=".json,application/json"
            @change="handleJsonFileUpload"
          >
          <small class="field-hint">Upload a .json file to auto-fill the field below.</small>
        </div>
        <textarea
          id="jsonData"
          v-model="jsonDataString"
          required
          rows="10"
          class="code"
        />
      </div>

      <div class="form-group">
        <label>
          <input
            v-model="form.isPublished"
            type="checkbox"
          >
          Published
        </label>
      </div>

      <div class="form-group">
        <label>
          <input
            v-model="form.isFeatured"
            type="checkbox"
          >
          Featured
        </label>
      </div>

      <div class="form-actions">
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="loading"
        >
          {{ loading ? 'Saving...' : 'Save Workflow' }}
        </button>
        <router-link
          to="/admin/workflows"
          class="btn btn-secondary"
        >
          Cancel
        </router-link>
      </div>

      <div
        v-if="error"
        class="alert alert-error mt-2"
      >
        {{ error }}
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiClient } from '@utils/api';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

interface Props {
  isNew?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isNew: false,
});

const route = useRoute();
const router = useRouter();

const form = ref({
  title: '',
  slug: '',
  description: '',
  content: '',
  category: '',
  difficulty: 'easy' as 'easy' | 'medium' | 'hard',
  author: 'Admin',
  version: '1.0.0',
  isPublished: false,
  isFeatured: false,
});

const tagsString = ref('');
const jsonDataString = ref('{\n  "nodes": [],\n  "connections": []\n}');
const loading = ref(false);
const error = ref('');
const categories = ref<Array<{ id: string; name: string; slug: string; icon?: string }>>([]);
const editorToolbar = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'blockquote'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link', 'image'],
  ['clean'],
];

const workflowId = computed(() => route.params.id as string);

async function handleSubmit() {
  loading.value = true;
  error.value = '';

  try {
    if (form.value.description.trim().length < 10) {
      throw new Error('Description must contain at least 10 characters');
    }

    // Parse JSON
    const jsonData = JSON.parse(jsonDataString.value);

    // Parse tags
    const tags = tagsString.value
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const data = {
      ...form.value,
      tags,
      jsonData,
    };

    if (props.isNew) {
      await apiClient.createWorkflow(data);
      router.push('/admin/workflows');
    } else {
      await apiClient.updateWorkflow(workflowId.value, data);
      router.push('/admin/workflows');
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to save workflow';
  } finally {
    loading.value = false;
  }
}

async function handleJsonFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    const raw = await file.text();
    const parsed = JSON.parse(raw);
    jsonDataString.value = JSON.stringify(parsed, null, 2);
    error.value = '';
  } catch (err) {
    error.value = 'Invalid JSON file. Please upload a valid n8n workflow JSON.';
  } finally {
    // Allow selecting the same file again.
    input.value = '';
  }
}

onMounted(async () => {
  // Load categories from API
  try {
    const catResp = await apiClient.getAdminCategories();
    categories.value = catResp.data;
  } catch (err) {
    console.error('Failed to load categories:', err);
  }

  if (!props.isNew && workflowId.value) {
    try {
      const response = await apiClient.getAdminWorkflow(workflowId.value);
      const workflow = response.data;

      form.value = {
        title: workflow.title,
        slug: workflow.slug,
        description: workflow.description,
        content: workflow.content || '',
        category: workflow.category,
        difficulty: workflow.difficulty,
        author: workflow.author,
        version: workflow.version,
        isPublished: workflow.isPublished,
        isFeatured: workflow.isFeatured,
      };

      tagsString.value = workflow.tags.join(', ');
      jsonDataString.value = JSON.stringify(workflow.jsonData, null, 2);
    } catch (err) {
      error.value = 'Failed to load workflow';
    }
  }
});
</script>

<style scoped>
.workflow-editor {
  max-width: 800px;
  background: #0b0b0b;
  padding: 1.3rem;
  border-radius: 16px;
  border: 1px solid #252525;
}

.code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.55;
}

.json-upload-row {
  margin-bottom: 0.6rem;
}

.rich-editor :deep(.ql-toolbar.ql-snow),
.rich-editor :deep(.ql-container.ql-snow) {
  border-color: #2a2a2a;
}

.rich-editor :deep(.ql-toolbar.ql-snow) {
  background: #0f0f0f;
}

.rich-editor :deep(.ql-toolbar .ql-picker-label),
.rich-editor :deep(.ql-toolbar .ql-picker-item),
.rich-editor :deep(.ql-toolbar button) {
  color: #dfe6f2;
}

.rich-editor :deep(.ql-toolbar button .ql-stroke),
.rich-editor :deep(.ql-toolbar .ql-picker-label .ql-stroke),
.rich-editor :deep(.ql-toolbar .ql-picker-item .ql-stroke) {
  stroke: #dfe6f2;
}

.rich-editor :deep(.ql-toolbar button .ql-fill),
.rich-editor :deep(.ql-toolbar .ql-picker-label .ql-fill),
.rich-editor :deep(.ql-toolbar .ql-picker-item .ql-fill) {
  fill: #dfe6f2;
}

.rich-editor :deep(.ql-toolbar button:hover .ql-stroke),
.rich-editor :deep(.ql-toolbar button.ql-active .ql-stroke),
.rich-editor :deep(.ql-toolbar .ql-picker-label:hover .ql-stroke),
.rich-editor :deep(.ql-toolbar .ql-picker-label.ql-active .ql-stroke) {
  stroke: #ffffff;
}

.rich-editor :deep(.ql-toolbar button:hover .ql-fill),
.rich-editor :deep(.ql-toolbar button.ql-active .ql-fill),
.rich-editor :deep(.ql-toolbar .ql-picker-label:hover .ql-fill),
.rich-editor :deep(.ql-toolbar .ql-picker-label.ql-active .ql-fill) {
  fill: #ffffff;
}

.rich-editor :deep(.ql-toolbar button:hover),
.rich-editor :deep(.ql-toolbar button.ql-active),
.rich-editor :deep(.ql-toolbar .ql-picker-label:hover),
.rich-editor :deep(.ql-toolbar .ql-picker-label.ql-active) {
  color: #ffffff;
}

.rich-editor :deep(.ql-container.ql-snow) {
  background: #0b0b0b;
  color: #efefef;
  min-height: 280px;
}

.rich-editor :deep(.ql-editor) {
  min-height: 240px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.field-hint {
  display: block;
  margin-top: 0.4rem;
  color: #8e8e8e;
  font-size: 0.78rem;
}
</style>
