<template>
  <div class="node-shell">
    <div class="n8n-node" :class="{ selected, disabled: data.disabled }" :style="{ '--accent': data.accent }">
      <Handle id="in" type="target" :position="Position.Left" class="port in-port" />

      <Handle
        v-for="port in topAuxPorts"
        :id="port.id"
        :key="port.id"
        type="source"
        :position="Position.Top"
        :style="{ left: `${port.left}%` }"
        class="port aux-port top-port"
      />

      <Handle
        v-for="port in sourcePorts"
        :id="port.id"
        :key="port.id"
        type="source"
        :position="Position.Right"
        :style="{ top: `${port.top}%` }"
        class="port out-port"
      />

      <Handle
        v-for="port in bottomAuxPorts"
        :id="port.id"
        :key="port.id"
        type="target"
        :position="Position.Bottom"
        :style="{ left: `${port.left}%` }"
        class="port aux-port bottom-port"
      />

      <div class="icon-badge">{{ data.icon }}</div>
    </div>

    <div class="node-title" :title="data.label">{{ data.label }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Handle, Position, type NodeProps } from '@vue-flow/core';

interface NodeData {
  label: string;
  type: string;
  outputs: number;
  icon: string;
  accent: string;
  disabled: boolean;
  topAuxOutputs: string[];
  bottomAuxInputs: string[];
}

const props = defineProps<NodeProps<NodeData>>();

const outputCount = computed(() => Math.min(Math.max(props.data.outputs ?? 0, 0), 6));
const topAuxCount = computed(() => props.data.topAuxOutputs?.length || 0);
const bottomAuxCount = computed(() => props.data.bottomAuxInputs?.length || 0);

function distribute(count: number) {
  if (count <= 0) return [];
  if (count === 1) return [50];
  const start = 24;
  const end = 76;
  const gap = (end - start) / (count - 1);
  return Array.from({ length: count }, (_, index) => +(start + gap * index).toFixed(2));
}

const sourcePorts = computed(() => {
  if (outputCount.value <= 0) return [];
  if (outputCount.value === 1) {
    return [{ id: 'out-0', top: 50 }];
  }

  const start = 22;
  const end = 78;
  const gap = (end - start) / (outputCount.value - 1);
  return Array.from({ length: outputCount.value }, (_, index) => ({
    id: `out-${index}`,
    top: +(start + gap * index).toFixed(2),
  }));
});

const topAuxPorts = computed(() => {
  const positions = distribute(topAuxCount.value);
  return positions.map((left, index) => ({
    id: props.data.topAuxOutputs[index],
    left,
  }));
});

const bottomAuxPorts = computed(() => {
  const positions = distribute(bottomAuxCount.value);
  return positions.map((left, index) => ({
    id: props.data.bottomAuxInputs[index],
    left,
  }));
});
</script>

<style scoped>
.node-shell {
  width: 58px;
}

.n8n-node {
  width: 58px;
  height: 58px;
  border-radius: 7px;
  border: 1px solid color-mix(in srgb, var(--accent) 55%, #2f3641);
  background: color-mix(in srgb, var(--accent) 18%, #101319);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
  color: #f0f2f5;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.n8n-node.selected {
  border-color: #8fa7ff;
  box-shadow: 0 0 0 1px #8fa7ff;
}

.n8n-node.disabled {
  opacity: 0.75;
}

.icon-badge {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid color-mix(in srgb, var(--accent) 70%, #2e3340);
  background: color-mix(in srgb, var(--accent) 32%, #121722);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 700;
  color: #f8fbff;
}

.node-title {
  margin-top: 6px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
  color: #f2f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 58px;
  text-align: center;
}

.port {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: 1px solid #64748b;
  background: #0f1116;
}

.out-port {
  border-color: #c4cad3;
  background: #e5e7eb;
}

.aux-port {
  width: 7px;
  height: 7px;
  border-radius: 2px;
}
</style>
