import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@stores/auth';
import type { RouteLocationNormalized } from 'vue-router';

// Lazy load pages for code splitting
const Home = () => import('@pages/Home.vue');
const WorkflowList = () => import('@pages/WorkflowList.vue');
const WorkflowDetail = () => import('@pages/WorkflowDetail.vue');
const Admin = () => import('@pages/Admin.vue');
const AdminDashboard = () => import('@pages/AdminDashboard.vue');
const AdminWorkflows = () => import('@pages/AdminWorkflows.vue');
const AdminWorkflowEditor = () => import('@pages/AdminWorkflowEditor.vue');
const Login = () => import('@pages/Login.vue');
const Embed = () => import('@pages/Embed.vue');
const NotFound = () => import('@pages/NotFound.vue');

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: 'n8n Workflow Library' },
  },
  {
    path: '/workflows',
    name: 'WorkflowList',
    component: WorkflowList,
    meta: { title: 'Workflows' },
  },
  {
    path: '/workflows/:slug',
    name: 'WorkflowDetail',
    component: WorkflowDetail,
    props: true,
    meta: { title: 'Workflow Details' },
  },
  {
    path: '/embed/:slug',
    name: 'Embed',
    component: Embed,
    props: true,
    meta: { layout: 'embed', hideNav: true, hideFooter: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: 'Admin Login', requiresGuest: true },
  },
  {
    path: '/admin',
    component: Admin,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: AdminDashboard,
        meta: { title: 'Dashboard' },
      },
      {
        path: 'workflows',
        name: 'AdminWorkflows',
        component: AdminWorkflows,
        meta: { title: 'Manage Workflows' },
      },
      {
        path: 'workflows/new',
        name: 'AdminWorkflowCreate',
        component: AdminWorkflowEditor,
        meta: { title: 'Create Workflow' },
        props: { isNew: true },
      },
      {
        path: 'workflows/:id/edit',
        name: 'AdminWorkflowEdit',
        component: AdminWorkflowEditor,
        meta: { title: 'Edit Workflow' },
        props: true,
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { title: 'Not Found' },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// Global navigation guard
router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
  const authStore = useAuthStore();

  // Check authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      return { name: 'Login', query: { redirect: to.fullPath } };
    }
  }

  // Redirect authenticated users away from login
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return { name: 'Home' };
  }

  // Update title
  if (to.meta.title) {
    document.title = `${to.meta.title} - n8n Workflow Library`;
  }
});

export default router;
