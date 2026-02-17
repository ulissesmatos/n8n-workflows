<template>
  <div
    v-if="hasWorkflow"
    class="workflow-canvas"
    :style="{ height: `${canvasHeight}px` }"
  >
    <n8n-demo
      ref="demoRef"
      class="n8n-demo-host"
      :style="{ height: `${canvasHeight}px`, '--n8n-workflow-min-height': `${canvasHeight}px` }"
    />
  </div>

  <div v-else class="canvas-empty">
    <p>Invalid or empty workflow. No nodes to display.</p>
  </div>
</template>

<script setup lang="ts">
import '@n8n_io/n8n-demo-component';
import { computed, nextTick, ref, watch } from 'vue';
import type { Workflow } from '@app-types/index';

interface Props {
  workflow: Workflow | null;
  interactive?: boolean;
  clickToInteract?: boolean;
  height?: number;
}

interface N8nDemoElement extends HTMLElement {
  workflow?: string;
}

const props = withDefaults(defineProps<Props>(), {
  interactive: false,
  clickToInteract: false,
  height: 560,
});

const demoRef = ref<N8nDemoElement | null>(null);

const parsedWorkflow = computed<Record<string, unknown> | null>(() => {
  const raw = props.workflow?.jsonData;
  if (!raw) return null;

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  }

  return raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : null;
});

const normalizedWorkflow = computed<Record<string, unknown> | null>(() => {
  const raw = parsedWorkflow.value;
  if (!raw) return null;

  if (Array.isArray(raw.nodes)) return raw;

  const nested = raw.workflow;
  if (nested && typeof nested === 'object') {
    const workflowObj = nested as Record<string, unknown>;
    if (Array.isArray(workflowObj.nodes)) return workflowObj;
  }

  return null;
});

const hasWorkflow = computed(() => {
  const wf = normalizedWorkflow.value;
  if (!wf) return false;
  return Array.isArray(wf.nodes) && wf.nodes.length > 0;
});

const canvasHeight = computed(() => {
  const value = Number(props.height);
  if (!Number.isFinite(value)) return 560;
  return Math.max(320, Math.round(value));
});

async function syncDemoElement() {
  await nextTick();
  const el = demoRef.value;
  const wf = normalizedWorkflow.value;
  if (!el || !wf) return;

  const serializedWorkflow = JSON.stringify(wf);
  el.workflow = serializedWorkflow;
  el.setAttribute('workflow', serializedWorkflow);
  el.setAttribute('theme', 'dark');
  el.setAttribute('tidyup', 'true');
  if (props.clickToInteract) {
    el.setAttribute('clicktointeract', 'true');
  } else {
    el.removeAttribute('clicktointeract');
  }

  if (props.interactive) {
    el.removeAttribute('disableinteractivity');
  } else {
    el.setAttribute('disableinteractivity', 'true');
  }

  // Safety net for n8n demo behavior: if an interaction overlay still appears,
  // auto-open it to keep the canvas visible in embeds.
  if (!props.clickToInteract) {
    forceOpenWorkflow(el);
  }
}

function forceOpenWorkflow(el: N8nDemoElement) {
  let attempts = 0;
  const maxAttempts = 25;

  const timer = window.setInterval(() => {
    attempts += 1;

    const root = (el as unknown as { shadowRoot?: ShadowRoot | null }).shadowRoot;
    if (root) {
      const candidates = root.querySelectorAll('button, [role="button"]');
      for (const candidate of Array.from(candidates)) {
        const text = (candidate.textContent || '').trim().toLowerCase();
        if (text.includes('show workflow')) {
          (candidate as HTMLElement).click();
          window.clearInterval(timer);
          return;
        }
      }
    }

    if (attempts >= maxAttempts) {
      window.clearInterval(timer);
    }
  }, 200);
}

watch([parsedWorkflow, () => props.interactive, () => props.clickToInteract], () => {
  syncDemoElement();
}, { immediate: true });
</script>

<style scoped>
.workflow-canvas {
  border: 1px solid #242424;
  border-radius: 14px;
  overflow: hidden;
  background: #0b0e12;
}

.n8n-demo-host {
  display: block;
  width: 100%;
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
