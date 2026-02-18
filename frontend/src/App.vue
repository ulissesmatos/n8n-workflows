<template>
  <div
    id="app"
    class="app"
    :class="{ 'embed-mode': isEmbedMode }"
  >
    <!-- Navigation -->
    <nav
      v-if="!isEmbedMode && !route.meta.hideNav"
      class="navbar"
    >
      <div class="navbar-container">
        <router-link
          to="/"
          class="navbar-logo"
        >
          n8n Workflow Library
        </router-link>
        
        <ul class="nav-menu">
          <li class="nav-item">
            <a
              href="https://skiptodone.com/workflows"
              class="nav-link"
              target="_blank"
            >
              Workflows ↗
            </a>
          </li>
          <li
            v-if="!authStore.isAuthenticated"
            class="nav-item"
          >
            <router-link
              to="/login"
              class="nav-link"
            >
              Admin
            </router-link>
          </li>
          <li
            v-else
            class="nav-item"
          >
            <router-link
              to="/admin"
              class="nav-link"
            >
              Dashboard
            </router-link>
          </li>
          <li
            v-if="authStore.isAuthenticated"
            class="nav-item"
          >
            <button
              class="nav-link logout-btn"
              @click="logout"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- Footer -->
    <footer
      v-if="!isEmbedMode && !route.meta.hideFooter"
      class="footer"
    >
      <p>&copy; 2024 n8n Workflow Library. Built with Vue 3 and Fastify.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { useAuthStore } from '@stores/auth';

const route = useRoute();
const authStore = useAuthStore();

const isEmbedMode = computed(() => route.meta.layout === 'embed');

function logout() {
  authStore.logout();
  window.location.href = '/';
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: transparent;
}

.app.embed-mode {
  background: transparent;
}

.navbar {
  background: rgba(9, 9, 9, 0.86);
  backdrop-filter: blur(10px);
  color: #f3f3f3;
  padding: 0.85rem 0;
  border-bottom: 1px solid #222;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-logo {
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #f8f8f8;
  text-decoration: none;
  transition: opacity 180ms ease;
}

.navbar-logo:hover {
  opacity: 0.72;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
  margin: 0;
  padding: 0;
}

.nav-item {
  display: flex;
}

.nav-link {
  color: #d0d0d0;
  text-decoration: none;
  transition: color 180ms ease;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
}

.nav-link:hover {
  color: #ffffff;
}

.logout-btn {
  padding: 0.4rem 0.85rem;
  background: #111;
  border-radius: 10px;
  border: 1px solid #2d2d2d;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem 1rem 2rem;
}

.app.embed-mode .main-content {
  max-width: none;
  margin: 0;
  padding: 0;
}

.footer {
  background: #090909;
  border-top: 1px solid #1e1e1e;
  padding: 1.3rem;
  text-align: center;
  color: #888;
  margin-top: 2rem;
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .navbar {
    padding: 0.6rem 0;
  }

  .navbar-container {
    padding: 0 0.75rem;
    justify-content: center;
    gap: 1.5rem;
  }

  .navbar-logo {
    font-size: 0.95rem;
  }

  .nav-menu {
    gap: 1rem;
    margin: 0;
    padding: 0;
  }

  .nav-item {
    flex: 0 0 auto;
  }

  .nav-link {
    font-size: 0.85rem;
  }

  .logout-btn {
    padding: 0.3rem 0.7rem;
    font-size: 0.85rem;
  }

  .main-content {
    padding: 1rem 0.75rem;
    overflow-x: hidden;
  }

  .footer {
    font-size: 0.75rem;
    padding: 1rem;
  }
}
</style>
