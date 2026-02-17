<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <h2>Admin Panel</h2>
      </div>
      <nav class="sidebar-nav">
        <router-link
          to="/admin"
          class="nav-item"
        >
          Dashboard
        </router-link>
        <router-link
          to="/admin/workflows"
          class="nav-item"
        >
          Workflows
        </router-link>
        <router-link
          to="/admin/categories"
          class="nav-item"
        >
          Categories
        </router-link>
        <button
          class="nav-item logout"
          @click="handleLogout"
        >
          Logout
        </button>
      </nav>
    </aside>

    <main class="admin-main">
      <router-view />
    </main>
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
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
  background: transparent;
  gap: 1rem;
}

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

.nav-item {
  padding: 1rem 1.5rem;
  text-decoration: none;
  color: #b6b6b6;
  display: block;
  transition: color 180ms ease, background-color 180ms ease;
  border-left: 3px solid transparent;
  background: none;
  border: none;
  text-align: left;
  font-size: 0.95rem;
  cursor: pointer;
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
}

@media (max-width: 768px) {
  .admin-layout {
    grid-template-columns: 1fr;
  }

  .admin-sidebar {
    border-right: 1px solid #242424;
    border-bottom: 1px solid #242424;
  }

  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
  }

  .nav-item {
    padding: 0.75rem 1rem;
    white-space: nowrap;
  }
}
</style>
