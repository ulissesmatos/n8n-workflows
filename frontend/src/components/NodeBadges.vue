<template>
  <div
    v-if="nodes.length"
    class="node-badges"
    :class="{ 'node-badges--compact': compact }"
  >
    <span
      v-for="node in visibleNodes"
      :key="node.type"
      class="node-badge"
      :title="node.label"
      :style="{ width: size + 'px', height: size + 'px' }"
      v-html="node.icon.svg"
    />
    <span
      v-if="extraCount > 0"
      class="node-badge node-badge--more"
      :title="`${extraCount} more nodes`"
    >
      +{{ extraCount }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// @ts-ignore
import { extractNodes } from '@/utils/n8n-node-icons.js';

interface Props {
  jsonData: any;
  max?: number;
  size?: number;
  compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  max: 6,
  size: 22,
  compact: false,
});

interface NodeInfo {
  type: string;
  label: string;
  icon: { svg: string; color: string; label: string };
}

const nodes = computed<NodeInfo[]>(() => {
  if (!props.jsonData) return [];
  try {
    return extractNodes(props.jsonData);
  } catch {
    return [];
  }
});

const visibleNodes = computed(() => nodes.value.slice(0, props.max));
const extraCount = computed(() => Math.max(0, nodes.value.length - props.max));
</script>

<style scoped>
.node-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.node-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 3px;
  transition: transform 140ms ease, box-shadow 140ms ease;
  cursor: default;
  flex-shrink: 0;
}

.node-badge:hover {
  transform: scale(1.18);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1;
}

.node-badge :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}

.node-badge--more {
  font-size: 11px;
  font-weight: 600;
  color: #a2a2a2;
  padding: 0 6px;
  min-width: 28px;
  width: auto !important;
  line-height: 1;
}

.node-badges--compact .node-badge {
  padding: 2px;
  border-radius: 4px;
}
</style>
