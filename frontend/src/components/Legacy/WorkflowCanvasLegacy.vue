<template>
  <div v-if="isValidWorkflow" class="workflow-canvas">
    <div
      class="flow-shell"
      @mousedown.capture="handleShellMouseDown"
      @mouseup.capture="handleShellMouseUp"
      @mouseleave.capture="handleShellMouseUp"
      @auxclick.prevent
    >
      <VueFlow
        class="flow"
        :nodes="flowNodes"
        :edges="flowEdges"
        :node-types="nodeTypes"
        :default-edge-options="defaultEdgeOptions"
        :fit-view-on-init="true"
        :nodes-draggable="false"
        :elements-selectable="true"
        :select-nodes-on-drag="false"
        :pan-on-drag="[1]"
        :zoom-on-double-click="false"
        :min-zoom="0.35"
        :max-zoom="2.2"
        @init="onFlowInit"
        @node-click="onNodeClick"
        @pane-click="onPaneClick"
      >
        <Background
          :gap="18"
          :size="1"
          pattern-color="#171a21"
        />
      </VueFlow>
    </div>

    <div class="canvas-manual-controls">
      <button class="control-btn" title="Zoom In" @click="zoomInView">+</button>
      <button class="control-btn" title="Zoom Out" @click="zoomOutView">-</button>
      <button class="control-btn" title="Fit View" @click="fitView">Fit</button>
      <button class="control-btn" title="Reset View" @click="resetView">Reset</button>
    </div>

    <div v-if="selectedNode" class="node-info-panel">
      <h4>Node Details</h4>
      <div class="info-row"><strong>Name:</strong> {{ selectedNode.name }}</div>
      <div class="info-row"><strong>Type:</strong> {{ selectedNode.type }}</div>
      <div class="info-row"><strong>Kind:</strong> {{ selectedNode.nodeKind }}</div>
      <div v-if="selectedNode.description" class="info-row">
        <strong>Description:</strong> {{ selectedNode.description }}
      </div>
      <div v-if="selectedNode.noteContent" class="info-row">
        <strong>Note:</strong> {{ selectedNode.noteContent }}
      </div>
      <div class="info-row"><strong>Parameters:</strong> {{ selectedNode.parameterCount }}</div>
      <div class="info-row"><strong>Outputs:</strong> {{ selectedNode.outputCount }}</div>
      <div class="info-row"><strong>Status:</strong> {{ selectedNode.disabled ? 'Disabled' : 'Enabled' }}</div>
      <button class="btn btn-small" @click="selectedNodeId = null">Close</button>
    </div>
  </div>

  <div v-else class="canvas-empty">
    <p>Invalid or empty workflow. No nodes to display.</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  VueFlow,
  MarkerType,
  type Node,
  type Edge,
  type NodeMouseEvent,
  type DefaultEdgeOptions,
  type ViewportTransform,
} from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import type { Workflow } from '@app-types/index';
import N8nCanvasNode from './canvas/N8nCanvasNode.vue';
import N8nCanvasNote from './canvas/N8nCanvasNote.vue';

interface Props {
  workflow: Workflow | null;
  interactive?: boolean;
}

interface ParsedNode {
  id: string;
  name: string;
  type: string;
  nodeKind: 'node' | 'note';
  typeLabel: string;
  icon: string;
  accent: string;
  position: { x: number; y: number };
  outputCount: number;
  parameterCount: number;
  disabled: boolean;
  noteContent?: string;
  noteWidth?: number;
  noteHeight?: number;
  description?: string;
}

interface ParsedConnection {
  source: string;
  target: string;
  channel: string;
  outputIndex: number;
  inputIndex: number;
}

interface CanvasFlowApi {
  zoomIn: (options?: { duration?: number }) => void;
  zoomOut: (options?: { duration?: number }) => void;
  fitView: (options?: { duration?: number; padding?: number }) => void;
  setViewport: (viewport: ViewportTransform, options?: { duration?: number }) => void;
}

const props = withDefaults(defineProps<Props>(), {
  interactive: false,
});

const selectedNodeId = ref<string | null>(null);
const flowApi = ref<CanvasFlowApi | null>(null);

const nodeTypes = {
  n8n: N8nCanvasNode,
  n8nNote: N8nCanvasNote,
};

const defaultEdgeOptions: DefaultEdgeOptions = {
  type: 'smoothstep',
  markerEnd: MarkerType.ArrowClosed,
  style: {
    stroke: '#7b8592',
    strokeWidth: 1.8,
  },
};

function parseWorkflowJson(rawJson: unknown): Record<string, unknown> | null {
  if (typeof rawJson === 'string') {
    try {
      const parsed = JSON.parse(rawJson);
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }

  return rawJson && typeof rawJson === 'object' ? (rawJson as Record<string, unknown>) : null;
}

function parsePosition(position: unknown): { x: number; y: number } {
  if (Array.isArray(position)) {
    return {
      x: typeof position[0] === 'number' ? position[0] : 0,
      y: typeof position[1] === 'number' ? position[1] : 0,
    };
  }

  if (position && typeof position === 'object') {
    const p = position as Record<string, unknown>;
    return {
      x: typeof p.x === 'number' ? p.x : 0,
      y: typeof p.y === 'number' ? p.y : 0,
    };
  }

  return { x: 0, y: 0 };
}

function toTypeLabel(rawType: string): string {
  const parts = rawType.split('.');
  return parts[parts.length - 1] || rawType;
}

function getNodeVisual(rawType: string): { icon: string; accent: string } {
  const type = rawType.toLowerCase();
  if (type.includes('http')) return { icon: 'HTTP', accent: '#6b66ff' };
  if (type.includes('postgres') || type.includes('mysql') || type.includes('db')) {
    return { icon: 'DB', accent: '#2f8dd8' };
  }
  if (type.includes('code') || type.includes('function')) return { icon: '{}', accent: '#f59e0b' };
  if (type.includes('if') || type.includes('switch')) return { icon: 'IF', accent: '#14b86f' };
  if (type.includes('set')) return { icon: 'SET', accent: '#4f7cff' };
  if (type.includes('schedule') || type.includes('trigger')) return { icon: 'TRG', accent: '#10b8a2' };
  if (type.includes('merge')) return { icon: 'MRG', accent: '#7c5cff' };
  if (type.includes('webhook')) return { icon: 'WEB', accent: '#ff6d3a' };
  return { icon: 'N8N', accent: '#7c8799' };
}

function parseStickyColor(parameters: Record<string, unknown>): string {
  const color = parameters.color;
  if (typeof color === 'string' && color.trim()) return color.trim();
  return '#265a9a';
}

function toHandleSafe(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function makeAuxOutHandleId(channel: string, outputIndex: number): string {
  return `aux-out-${toHandleSafe(channel)}-${outputIndex}`;
}

function makeAuxInHandleId(channel: string, inputIndex: number): string {
  return `aux-in-${toHandleSafe(channel)}-${inputIndex}`;
}

function extractNodes(data: Record<string, unknown>): ParsedNode[] {
  const source =
    Array.isArray(data.nodes)
      ? data.nodes
      : Array.isArray((data.workflow as Record<string, unknown> | undefined)?.nodes)
        ? ((data.workflow as Record<string, unknown>).nodes as unknown[])
        : [];

  return source
    .filter((n): n is Record<string, unknown> => !!n && typeof n === 'object')
    .map((node, index) => {
      const type = String(node.type ?? 'unknown');
      const typeLabel = toTypeLabel(type);
      const parameters =
        node.parameters && typeof node.parameters === 'object'
          ? (node.parameters as Record<string, unknown>)
          : {};
      const isSticky = type.toLowerCase().includes('stickynote');
      const visual = getNodeVisual(type);

      return {
        id: String(node.id ?? node.name ?? index),
        name: String(node.name ?? `Node ${index + 1}`),
        type,
        nodeKind: isSticky ? 'note' : 'node',
        typeLabel,
        icon: visual.icon,
        accent: visual.accent,
        description:
          typeof node.description === 'string'
            ? node.description
            : typeof node.notesInFlow === 'string'
              ? node.notesInFlow
              : undefined,
        position: parsePosition(node.position),
        parameterCount: Object.keys(parameters).length,
        disabled: Boolean(node.disabled),
      outputCount:
        typeof node.outputs === 'number'
          ? Math.max(0, node.outputs)
          : typeof node.outputCount === 'number'
            ? Math.max(0, node.outputCount)
            : 0,
        noteContent: typeof parameters.content === 'string' ? parameters.content : undefined,
        noteWidth:
          typeof parameters.width === 'number'
            ? Math.max(180, parameters.width)
            : typeof node.width === 'number'
              ? Math.max(180, node.width as number)
              : 220,
        noteHeight:
          typeof parameters.height === 'number'
            ? Math.max(100, parameters.height)
            : typeof node.height === 'number'
              ? Math.max(100, node.height as number)
              : 130,
        ...(isSticky ? { accent: parseStickyColor(parameters), icon: 'NOTE' } : {}),
      };
    });
}

function extractConnections(data: Record<string, unknown>): ParsedConnection[] {
  const connections = data.connections;
  if (!connections || typeof connections !== 'object') return [];

  const parsed: ParsedConnection[] = [];

  for (const [fromName, channels] of Object.entries(connections as Record<string, unknown>)) {
    if (!channels || typeof channels !== 'object') continue;

    for (const [channelName, channelGroups] of Object.entries(channels as Record<string, unknown>)) {
      if (!Array.isArray(channelGroups)) continue;

      channelGroups.forEach((branch, outputIndex) => {
        if (!Array.isArray(branch)) return;

        branch.forEach((target) => {
          if (!target || typeof target !== 'object') return;
          const targetRecord = target as Record<string, unknown>;
          const targetName = targetRecord.node;
          if (typeof targetName === 'string' && targetName.length > 0) {
            parsed.push({
              source: fromName,
              target: targetName,
              channel: channelName,
              outputIndex,
              inputIndex:
                typeof targetRecord.index === 'number' ? Math.max(0, targetRecord.index) : 0,
            });
          }
        });
      });
    }
  }

  return parsed;
}

const parsed = computed(() => {
  const raw = parseWorkflowJson(props.workflow?.jsonData);
  if (!raw) return { nodes: [] as ParsedNode[], connections: [] as ParsedConnection[] };

  const nodes = extractNodes(raw);
  const connections = extractConnections(raw);

  const outputCountByName = new Map<string, number>();
  connections.forEach((connection) => {
    if (connection.channel !== 'main') return;
    outputCountByName.set(
      connection.source,
      Math.max(outputCountByName.get(connection.source) || 1, connection.outputIndex + 1)
    );
  });

  const mergedNodes = nodes.map((node) => ({
    ...node,
    outputCount: Math.max(node.outputCount, outputCountByName.get(node.name) || 0),
  }));

  return { nodes: mergedNodes, connections };
});

const nameToIdMap = computed(() => {
  const map = new Map<string, string>();
  parsed.value.nodes.forEach((node) => {
    map.set(node.name, node.id);
    map.set(node.id, node.id);
  });
  return map;
});

const normalizedNodes = computed(() => {
  const list = parsed.value.nodes;
  if (list.length === 0) return list;

  const minX = Math.min(...list.map((node) => node.position.x));
  const minY = Math.min(...list.map((node) => node.position.y));
  const padding = 80;

  return list.map((node) => ({
    ...node,
    position: {
      x: node.position.x - minX + padding,
      y: node.position.y - minY + padding,
    },
  }));
});

const portState = computed(() => {
  const mainOutputs = new Map<string, number>();
  const topAuxOutputs = new Map<string, string[]>();
  const bottomAuxInputs = new Map<string, string[]>();

  const pushUnique = (map: Map<string, string[]>, key: string, value: string) => {
    const prev = map.get(key) || [];
    if (!prev.includes(value)) prev.push(value);
    map.set(key, prev);
  };

  parsed.value.connections.forEach((connection) => {
    const sourceId = nameToIdMap.value.get(connection.source);
    const targetId = nameToIdMap.value.get(connection.target);
    if (!sourceId || !targetId) return;

    if (connection.channel === 'main') {
      mainOutputs.set(
        sourceId,
        Math.max(mainOutputs.get(sourceId) || 0, connection.outputIndex + 1)
      );
      return;
    }

    pushUnique(
      topAuxOutputs,
      sourceId,
      makeAuxOutHandleId(connection.channel, connection.outputIndex)
    );
    pushUnique(
      bottomAuxInputs,
      targetId,
      makeAuxInHandleId(connection.channel, connection.inputIndex)
    );
  });

  return { mainOutputs, topAuxOutputs, bottomAuxInputs };
});

const flowNodes = computed<Node[]>(() =>
  normalizedNodes.value.map((node) => ({
    id: node.id,
    type: node.nodeKind === 'note' ? 'n8nNote' : 'n8n',
    position: node.position,
    draggable: false,
    selectable: true,
    connectable: node.nodeKind !== 'note',
    data: {
      label: node.name,
      type: node.type,
      typeLabel: node.typeLabel,
      icon: node.icon,
      accent: node.accent,
      outputs: Math.max(node.outputCount, portState.value.mainOutputs.get(node.id) || 0),
      disabled: node.disabled,
      topAuxOutputs: portState.value.topAuxOutputs.get(node.id) || [],
      bottomAuxInputs: portState.value.bottomAuxInputs.get(node.id) || [],
      title: node.name,
      content: node.noteContent || '',
      color: node.accent,
      width: node.noteWidth || 220,
      height: node.noteHeight || 130,
    },
  }))
);

const flowEdges = computed<Edge[]>(() => {
  const selected = selectedNodeId.value;
  const noteNodeIds = new Set(
    normalizedNodes.value.filter((node) => node.nodeKind === 'note').map((node) => node.id)
  );

  return parsed.value.connections
    .map((connection, index) => {
      const sourceId = nameToIdMap.value.get(connection.source);
      const targetId = nameToIdMap.value.get(connection.target);
      if (!sourceId || !targetId) return null;
      if (noteNodeIds.has(sourceId) || noteNodeIds.has(targetId)) return null;

      const isHighlighted = selected ? selected === sourceId || selected === targetId : false;
      const isMain = connection.channel === 'main';

      return {
        id: `edge-${index}-${sourceId}-${targetId}-${connection.outputIndex}`,
        source: sourceId,
        target: targetId,
        sourceHandle: isMain
          ? `out-${connection.outputIndex}`
          : makeAuxOutHandleId(connection.channel, connection.outputIndex),
        targetHandle: isMain
          ? 'in'
          : makeAuxInHandleId(connection.channel, connection.inputIndex),
        type: 'smoothstep',
        animated: false,
        style: {
          stroke: isHighlighted ? '#dfe7ff' : isMain ? '#7b8592' : '#8f98a8',
          strokeWidth: isHighlighted ? 2.4 : isMain ? 1.8 : 1.6,
          opacity: isHighlighted ? 0.96 : isMain ? 0.58 : 0.8,
          strokeDasharray: isMain ? '0' : '5 4',
        },
        markerEnd: MarkerType.ArrowClosed,
        zIndex: isHighlighted ? 3 : 1,
      } as Edge;
    })
    .filter((edge): edge is Edge => !!edge);
});

const selectedNode = computed(() => {
  if (!selectedNodeId.value) return null;
  return normalizedNodes.value.find((node) => node.id === selectedNodeId.value) || null;
});

const isValidWorkflow = computed(() => normalizedNodes.value.length > 0);

function onNodeClick(event: NodeMouseEvent) {
  selectedNodeId.value = event.node.id;
}

function onPaneClick() {
  selectedNodeId.value = null;
}

function onFlowInit(instance: unknown) {
  flowApi.value = instance as CanvasFlowApi;
}

function zoomInView() {
  flowApi.value?.zoomIn({ duration: 140 });
}

function zoomOutView() {
  flowApi.value?.zoomOut({ duration: 140 });
}

function fitView() {
  flowApi.value?.fitView({ duration: 180, padding: 0.2 });
}

function resetView() {
  flowApi.value?.setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 160 });
}

function handleShellMouseDown(event: MouseEvent) {
  if (event.button === 1) {
    // Prevent browser middle-click auto-scroll from hijacking canvas pan.
    event.preventDefault();
    document.body.classList.add('canvas-middle-pan');
  }
}

function handleShellMouseUp() {
  document.body.classList.remove('canvas-middle-pan');
}
</script>

<style scoped>
.workflow-canvas {
  position: relative;
  border: 1px solid #242424;
  border-radius: 14px;
  overflow: hidden;
  min-height: 560px;
  background: #0b0e12;
}

.flow {
  height: 560px;
  width: 100%;
}

.flow-shell {
  height: 560px;
  width: 100%;
}

:deep(.vue-flow__edge-path) {
  stroke-linecap: round;
  stroke-linejoin: round;
}

.canvas-manual-controls {
  position: absolute;
  right: 1rem;
  bottom: 1rem;
  display: flex;
  gap: 0.45rem;
  z-index: 12;
  background: rgba(14, 18, 24, 0.96);
  border: 1px solid #2d3440;
  border-radius: 10px;
  padding: 0.42rem;
}

.control-btn {
  min-width: 34px;
  height: 34px;
  border: 1px solid #2f3744;
  background: #121721;
  color: #dbe1ea;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms ease, border-color 150ms ease;
}

.control-btn:hover {
  background: #1a2230;
  border-color: #3f4a5d;
}

.node-info-panel {
  position: absolute;
  right: 1rem;
  top: 1rem;
  background: rgba(14, 18, 24, 0.96);
  border-radius: 10px;
  border: 1px solid #2d3440;
  padding: 1rem;
  width: 280px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 12;
}

.node-info-panel h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #efefef;
}

.info-row {
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  line-height: 1.4;
}

.info-row strong {
  display: block;
  color: #9c9c9c;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.canvas-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #a5a5a5;
  font-size: 1.125rem;
}
</style>
