import { ref, computed } from 'vue';
import type { Workflow } from '@app-types/index';

type WorkflowJson = Record<string, unknown>;

interface RenderNode {
  id: string;
  name: string;
  type: string;
  description?: string;
  parameters?: Record<string, unknown>;
  position: {
    x: number;
    y: number;
  };
  width: number;
  height: number;
  outputCount: number;
}

interface RenderConnection {
  from: string;
  to: string;
}

function parseWorkflowJson(rawJson: unknown): WorkflowJson | null {
  if (typeof rawJson === 'string') {
    try {
      const parsed = JSON.parse(rawJson);
      return parsed && typeof parsed === 'object' ? (parsed as WorkflowJson) : null;
    } catch {
      return null;
    }
  }

  return rawJson && typeof rawJson === 'object' ? (rawJson as WorkflowJson) : null;
}

function parseNodePosition(position: unknown): { x: number; y: number } {
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

function extractNodes(data: WorkflowJson): RenderNode[] {
  const source =
    Array.isArray(data.nodes) ? data.nodes : Array.isArray((data.workflow as WorkflowJson | undefined)?.nodes) ? ((data.workflow as WorkflowJson).nodes as unknown[]) : [];

  return source
    .filter((node): node is Record<string, unknown> => !!node && typeof node === 'object')
    .map((node, index) => {
      const position = parseNodePosition(node.position);
      const fallbackName = `Node ${index + 1}`;
      return {
        id: String(node.id ?? node.name ?? index),
        name: String(node.name ?? fallbackName),
        type: String(node.type ?? 'unknown'),
        description: typeof node.description === 'string' ? node.description : typeof node.notesInFlow === 'string' ? node.notesInFlow : undefined,
        parameters: node.parameters && typeof node.parameters === 'object' ? (node.parameters as Record<string, unknown>) : undefined,
        position,
        width: typeof node.width === 'number' ? node.width : 200,
        height: typeof node.height === 'number' ? node.height : 100,
        outputCount: typeof node.outputCount === 'number' ? node.outputCount : typeof node.outputs === 'number' ? node.outputs : 1,
      };
    });
}

function normalizeNodes(nodes: RenderNode[]): RenderNode[] {
  if (nodes.length === 0) return [];

  const minX = Math.min(...nodes.map((node) => node.position.x));
  const minY = Math.min(...nodes.map((node) => node.position.y));
  const padding = 60;

  return nodes.map((node) => ({
    ...node,
    position: {
      x: node.position.x - minX + padding,
      y: node.position.y - minY + padding,
    },
  }));
}

function extractConnections(data: WorkflowJson): RenderConnection[] {
  const connections = data.connections;
  if (!connections) return [];

  if (Array.isArray(connections)) {
    return connections
      .filter((conn): conn is Record<string, unknown> => !!conn && typeof conn === 'object')
      .map((conn) => ({
        from: String(conn.from ?? ''),
        to: String(conn.to ?? ''),
      }))
      .filter((conn) => conn.from.length > 0 && conn.to.length > 0);
  }

  if (typeof connections !== 'object') {
    return [];
  }

  const parsed: RenderConnection[] = [];

  for (const [fromNodeName, channels] of Object.entries(connections as Record<string, unknown>)) {
    if (!channels || typeof channels !== 'object') continue;

    for (const outputs of Object.values(channels as Record<string, unknown>)) {
      if (!Array.isArray(outputs)) continue;

      for (const branch of outputs) {
        if (!Array.isArray(branch)) continue;

        for (const target of branch) {
          if (!target || typeof target !== 'object') continue;
          const targetNode = (target as Record<string, unknown>).node;
          if (typeof targetNode === 'string' && targetNode.length > 0) {
            parsed.push({ from: fromNodeName, to: targetNode });
          }
        }
      }
    }
  }

  return parsed;
}

export function useWorkflowRenderer(workflow: Workflow | null) {
  const parsedWorkflow = computed(() => parseWorkflowJson(workflow?.jsonData));

  const nodes = computed(() => {
    if (!parsedWorkflow.value) return [];
    return normalizeNodes(extractNodes(parsedWorkflow.value));
  });

  const connections = computed(() => {
    if (!parsedWorkflow.value) return [];
    return extractConnections(parsedWorkflow.value);
  });

  const isValidWorkflow = computed(() => {
    return !!workflow && nodes.value.length > 0;
  });

  // Calculate canvas bounds
  const canvasBounds = computed(() => {
    if (nodes.value.length === 0) {
      return { minX: 0, minY: 0, maxX: 800, maxY: 600 };
    }

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    nodes.value.forEach((node) => {
      const x = node.position.x;
      const y = node.position.y;
      const width = node.width;
      const height = node.height;

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });

    return {
      minX: minX === Infinity ? 0 : minX,
      minY: minY === Infinity ? 0 : minY,
      maxX: maxX === -Infinity ? 800 : maxX,
      maxY: maxY === -Infinity ? 600 : maxY,
    };
  });

  const canvasWidth = computed(() => {
    const bounds = canvasBounds.value;
    return Math.max(800, bounds.maxX - bounds.minX + 100);
  });

  const canvasHeight = computed(() => {
    const bounds = canvasBounds.value;
    return Math.max(600, bounds.maxY - bounds.minY + 100);
  });

  return {
    nodes,
    connections,
    isValidWorkflow,
    canvasBounds,
    canvasWidth,
    canvasHeight,
  };
}

// Composable for managing filters and search
export function useWorkflowFilters() {
  const searchQuery = ref('');
  const selectedCategory = ref<string | undefined>();
  const selectedDifficulty = ref<string | undefined>();
  const selectedTags = ref<string[]>([]);

  const hasActiveFilters = computed(
    () =>
      searchQuery.value ||
      selectedCategory.value ||
      selectedDifficulty.value ||
      selectedTags.value.length > 0
  );

  function clearFilters() {
    searchQuery.value = '';
    selectedCategory.value = undefined;
    selectedDifficulty.value = undefined;
    selectedTags.value = [];
  }

  function toggleTag(tag: string) {
    const index = selectedTags.value.indexOf(tag);
    if (index > -1) {
      selectedTags.value.splice(index, 1);
    } else {
      selectedTags.value.push(tag);
    }
  }

  return {
    searchQuery,
    selectedCategory,
    selectedDifficulty,
    selectedTags,
    hasActiveFilters,
    clearFilters,
    toggleTag,
  };
}

// Composable for pagination
export function usePagination() {
  const currentPage = ref(1);
  const pageSize = ref(parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE || '20'));

  function nextPage() {
    currentPage.value++;
  }

  function prevPage() {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  }

  function goToPage(page: number) {
    currentPage.value = Math.max(1, page);
  }

  return {
    currentPage,
    pageSize,
    nextPage,
    prevPage,
    goToPage,
  };
}

