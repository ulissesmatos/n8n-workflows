<template>
  <div
    v-if="hasWorkflow"
    class="workflow-canvas"
    :class="{ 'workflow-canvas--ready': canvasReady }"
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
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
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
const canvasReady = ref(false);

/** Holds the teardown function for the current reveal cycle */
let cleanupReveal: (() => void) | null = null;

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

  if (!props.clickToInteract) {
    revealWorkflow(el);
  } else {
    canvasReady.value = true;
  }
}

/* ------------------------------------------------------------------ */
/*  Flicker-free reveal system                                        */
/*  - Canvas starts at opacity 0 (CSS class .workflow-canvas)         */
/*  - CSS is injected into the shadow DOM to hide the overlay          */
/*  - MutationObserver detects the "Show Workflow" button instantly    */
/*  - Canvas fades in only after the overlay is dismissed              */
/* ------------------------------------------------------------------ */

/** Inject a <style> into the shadow DOM to suppress the overlay before it paints */
function injectOverlayCSS(root: ShadowRoot): void {
  if (root.querySelector('[data-wf-hide-overlay]')) return;
  const style = document.createElement('style');
  style.setAttribute('data-wf-hide-overlay', '1');
  style.textContent =
    '.clicktointeract,' +
    '[class*="clickToInteract"],' +
    '[class*="click-to-interact"]' +
    '{display:none!important;pointer-events:none!important}';
  root.prepend(style);
}

/** Scan shadow DOM for the "Show Workflow" button and click it */
function tryDismissOverlay(root: ShadowRoot): boolean {
  const candidates = root.querySelectorAll('button, [role="button"]');
  for (const btn of Array.from(candidates)) {
    const text = (btn.textContent || '').trim().toLowerCase();
    if (text.includes('show workflow')) {
      (btn as HTMLElement).click();
      return true;
    }
  }
  return false;
}

/**
 * Orchestrates the overlay dismiss + reveal.
 * Replaces the old setInterval polling with:
 *   1. CSS injection (instant visual suppression)
 *   2. MutationObserver (zero-delay button detection)
 *   3. opacity transition (smooth reveal)
 */
function revealWorkflow(el: N8nDemoElement): void {
  // Tear down any previous cycle
  if (cleanupReveal) { cleanupReveal(); cleanupReveal = null; }
  canvasReady.value = false;

  let observer: MutationObserver | null = null;
  let fallbackTimer: number | null = null;
  let pollTimer: number | null = null;
  let settled = false;

  function settle(): void {
    if (settled) return;
    settled = true;
    if (observer) { observer.disconnect(); observer = null; }
    if (fallbackTimer !== null) { window.clearTimeout(fallbackTimer); fallbackTimer = null; }
    if (pollTimer !== null) { window.clearInterval(pollTimer); pollTimer = null; }
    // Let the canvas paint one frame before fading in
    window.setTimeout(() => { canvasReady.value = true; }, 100);
  }

  cleanupReveal = () => {
    settled = true;
    if (observer) { observer.disconnect(); observer = null; }
    if (fallbackTimer !== null) { window.clearTimeout(fallbackTimer); fallbackTimer = null; }
    if (pollTimer !== null) { window.clearInterval(pollTimer); pollTimer = null; }
  };

  function handleShadowRoot(root: ShadowRoot): void {
    injectOverlayCSS(root);

    if (tryDismissOverlay(root)) { settle(); return; }

    observer = new MutationObserver(() => {
      if (tryDismissOverlay(root)) settle();
    });
    observer.observe(root, { childList: true, subtree: true });
  }

  // Shadow root may not be attached yet (custom-element upgrade pending)
  const root = (el as unknown as { shadowRoot?: ShadowRoot | null }).shadowRoot;
  if (root) {
    handleShadowRoot(root);
  } else {
    let polls = 0;
    pollTimer = window.setInterval(() => {
      polls += 1;
      const sr = (el as unknown as { shadowRoot?: ShadowRoot | null }).shadowRoot;
      if (sr) {
        window.clearInterval(pollTimer!); pollTimer = null;
        handleShadowRoot(sr);
      } else if (polls >= 40) {       // 40 × 50 ms = 2 s
        window.clearInterval(pollTimer!); pollTimer = null;
        settle();
      }
    }, 50);
  }

  // Absolute safety net – always reveal within 3 s
  fallbackTimer = window.setTimeout(() => { fallbackTimer = null; settle(); }, 3000);
}

watch([parsedWorkflow, () => props.interactive, () => props.clickToInteract], () => {
  syncDemoElement();
}, { immediate: true });

onBeforeUnmount(() => {
  if (cleanupReveal) { cleanupReveal(); cleanupReveal = null; }
});
</script>

<style scoped>
.workflow-canvas {
  border: 1px solid #242424;
  border-radius: 14px;
  overflow: hidden;
  background: #0b0e12;
  /* Hidden until the overlay is dismissed; prevents any flash */
  opacity: 0;
  transition: opacity 0.35s ease;
}

.workflow-canvas--ready {
  opacity: 1;
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
