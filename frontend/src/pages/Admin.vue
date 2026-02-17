<template>
  <div class="admin-layout">
    <!-- Desktop sidebar -->
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <h2>Admin Panel</h2>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/admin" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          <span>Dashboard</span>
        </router-link>
        <router-link to="/admin/workflows" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          <span>Workflows</span>
        </router-link>
        <router-link to="/admin/categories" class="nav-item">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          <span>Categories</span>
        </router-link>
        <button class="nav-item logout" @click="handleLogout">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span>Logout</span>
        </button>
      </nav>
    </aside>

    <main class="admin-main">
      <router-view />
    </main>

    <!-- Mobile bottom nav -->
    <nav class="admin-bottom-nav">
      <router-link to="/admin" class="bottom-nav-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        <span>Dashboard</span>
      </router-link>
      <router-link to="/admin/workflows" class="bottom-nav-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        <span>Workflows</span>
      </router-link>
      <router-link to="/admin/categories" class="bottom-nav-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        <span>Categories</span>
      </router-link>
      <button class="bottom-nav-item bottom-nav-logout" @click="handleLogout">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        <span>Logout</span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

function handleLogout() {
  authStore.logout();
  router.push('/');
}
</script>

<style scoped>
.admin-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 100vh;
  background: transparent;
  gap: 1rem;
}

/* ── Desktop Sidebar ── */
.admin-sidebar {
  background: #0c0c0c;
  border: 1px solid #242424;
  border-radius: 16px;
  padding: 1.2rem 0;
}

.sidebar-header {
  padding: 0 1.5rem;
  margin-bottom: 2rem;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #f2f2f2;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
}

.nav-icon {
  display: none;
}

.nav-item {
  padding: 0.85rem 1.5rem;
  text-decoration: none;
  color: #b6b6b6;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  transition: color 180ms ease, background-color 180ms ease;
  border-left: 3px solid transparent;
  background: none;
  border: none;
  text-align: left;
  font-size: 0.95rem;
  cursor: pointer;
}

.nav-item .nav-icon {
  display: block;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.nav-item:hover {
  background: #131313;
  color: #f4f4f4;
}

.nav-item.router-link-exact-active {
  background: #f0f0f0;
  color: #111;
  border-left-color: #f0f0f0;
  font-weight: 600;
}

.nav-item.logout {
  color: #ffb6b6;
}

.nav-item.logout:hover {
  background: #1a0f0f;
}

.admin-main {
  padding: 0.5rem 0.3rem;
  overflow-y: auto;
  overflow-x: hidden;
}

/* ── Mobile Bottom Nav ── */
.admin-bottom-nav {
  display: none;
}

@media (max-width: 768px) {
  .admin-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    min-height: 100dvh;
    gap: 0;
  }

  /* Hide desktop sidebar */
  .admin-sidebar {
    display: none;
  }

  .admin-main {
    flex: 1;
    padding: 0.75rem;
    padding-bottom: calc(0.75rem + 72px); /* room for bottom nav */
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  /* Show mobile bottom nav */
  .admin-bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 200;
    background: rgba(10, 10, 10, 0.92);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-top: 1px solid #222;
    padding: 0.4rem 0;
    padding-bottom: max(0.4rem, env(safe-area-inset-bottom));
    justify-content: space-around;
    align-items: stretch;
  }

  .bottom-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    flex: 1;
    padding: 0.45rem 0.25rem;
    color: #777;
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    transition: color 150ms ease;
    -webkit-tap-highlight-color: transparent;
  }

  .bottom-nav-item svg {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
  }

  .bottom-nav-item span {
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.02em;
  }

  .bottom-nav-item.router-link-exact-active {
    color: #f0f0f0;
  }

  .bottom-nav-item.router-link-exact-active svg {
    filter: drop-shadow(0 0 4px rgba(255,255,255,0.15));
  }

  .bottom-nav-logout {
    color: #f87171;
  }
}
</style>
