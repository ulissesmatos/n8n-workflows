<template>
  <div
    class="n8n-note"
    :class="{ selected }"
    :style="{
      '--note-color': data.color,
      width: `${data.width}px`,
      minHeight: `${data.height}px`,
    }"
  >
    <div class="note-title" :title="data.title">{{ data.title }}</div>
    <div class="note-content">{{ data.content }}</div>
  </div>
</template>

<script setup lang="ts">
import { type NodeProps } from '@vue-flow/core';

interface NoteData {
  title: string;
  content: string;
  color: string;
  width: number;
  height: number;
}

defineProps<NodeProps<NoteData>>();
</script>

<style scoped>
.n8n-note {
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--note-color) 45%, #2b303a);
  background: color-mix(in srgb, var(--note-color) 22%, rgba(17, 20, 25, 0.96));
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  padding: 10px;
  color: #e8edf5;
}

.n8n-note.selected {
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--note-color) 60%, #98a2b3);
}

.note-title {
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-content {
  font-size: 10px;
  line-height: 1.35;
  color: #dbe2ec;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
