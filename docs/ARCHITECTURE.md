# Architecture & Design Decisions

Detailed architectural overview and design rationale for the n8n Workflow Library SaaS.

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     End Users / WordPress Sites                  │
│          (Browser / WordPress Plugin / iFrame embed)            │
└───────────────────────┬──────────────────────────────────────────┘
                        │
                   ┌────▼─────┐
                   │ HTTPS/TLS │
                   └────┬─────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
    ┌───▼───┐      ┌────▼────┐    ┌────▼────┐
    │ Nginx │      │ Reverse  │    │ Admin    │
    │Static │      │  Proxy   │    │ Portal   │
    │Files  │      │(Traefik) │    │(Vue 3)   │
    └───┬───┘      └────┬─────┘    └────┬─────┘
        │               │               │
        └───────────────┼───────────────┘
                        │
                   ┌────▼─────────────┐
                   │  Fastify Backend  │
                   │  (Node.js/REST)   │
                   └────┬──────────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
    ┌────▼────┐    ┌────▼─────┐  ┌───▼────┐
    │Cache    │    │Prisma    │  │Validation
    │Layer    │    │ORM       │  │(Zod)    │
    └────┬────┘    └────┬──────┘  └────────┘
         │              │
         └──────────────┼──────────────┐
                        │              │
                   ┌────▼──────────────▼──┐
                   │   PostgreSQL DB       │
                   │   (14+ with indexing) │
                   └───────────────────────┘
```

## 🗂️ Folder Structure Rationale

### Backend Structure

```
backend/
├── src/
│   ├── index.ts              # Fastify app initialization
│   ├── routes/               # API endpoints grouped by feature
│   │   ├── workflows.ts      # Public API (GET /workflows)
│   │   ├── admin.ts          # Protected routes (POST/PUT/DELETE)
│   │   ├── embed.ts          # WordPress embedding (lightweight)
│   │   └── health.ts         # Health check endpoint
│   ├── controllers/          # Request handling logic (future expansion)
│   ├── services/             # Business logic layer
│   │   └── workflow.service.ts  # Workflow CRUD, filtering, search
│   ├── middleware/           # Fastify middleware
│   │   └── auth.ts           # JWT verification, rate limiting
│   ├── schemas/              # Zod validation schemas
│   │   └── index.ts          # All request/response schemas
│   └── utils/                # Helpers
│       └── helpers.ts        # Sanitization, pagination, etc.
├── prisma/
│   ├── schema.prisma         # Database schema with relations
│   └── migrations/           # Database migration files
└── package.json
```

**Rationale:**
- **Routes-first organization** - Clear separation of concerns
- **Services layer** - Business logic testable and reusable
- **Single schema file** - Easy to maintain and understand data model
- **Utility functions** - DRY principle for common operations

### Frontend Structure

```
frontend/
├── src/
│   ├── main.ts               # Vue app bootstrap
│   ├── App.vue               # Root component with layout
│   ├── router/               # Vue Router with lazy loading
│   │   └── index.ts          # Route definitions
│   ├── pages/                # Full page components
│   │   ├── Home.vue
│   │   ├── WorkflowList.vue
│   │   ├── WorkflowDetail.vue
│   │   ├── Admin/
│   │   └── Embed.vue         # Lightweight embed view
│   ├── components/           # Reusable components
│   │   ├── WorkflowCanvas.vue # SVG workflow renderer
│   │   ├── WorkflowCard.vue
│   │   └── ...
│   ├── stores/               # Pinia stores
│   │   ├── workflows.ts      # Workflow state management
│   │   └── auth.ts           # Authentication state
│   ├── composables/          # Vue 3 composables
│   │   └── index.ts          # Reusable logic
│   ├── utils/                # Utilities
│   │   └── api.ts            # Axios instance & API calls
│   ├── types/                # TypeScript interfaces
│   │   └── index.ts          # All type definitions
│   └── styles/               # Global styles
│       └── main.css          # CSS variables & reset
└── vite.config.ts            # Vite build config with splitting
```

**Rationale:**
- **Page-based organization** - Easy to locate UI
- **Composables over mixins** - Vue 3 best practices
- **Centralized types** - Single source of truth
- **API client as util** - Reusable across all pages
- **Pinia stores** - Lightweight state management

## 🗄️ Database Design

### Schema Overview

```
AdminUser (1) ──────┐
                     │
                     ├─────── (N) Workflow
                     │
Workflow (1) ────────┼─────── (N) WorkflowReview
                     │
                     └─────── (1) WorkflowAnalytics

Category (1) ─────── (N) Workflow (tags array)
Tag (1) ──────────── (N) Workflow (tags array)

AuditLog ──────────── References: AdminUser, Workflow
```

### Key Design Decisions

#### 1. Full-Text Search
```sql
-- PostgreSQL tsvector for performance
ALTER TABLE "Workflow" ADD COLUMN searchVector tsvector;

CREATE TRIGGER updateSearchVector BEFORE INSERT OR UPDATE ON "Workflow"
FOR EACH ROW EXECUTE FUNCTION 
tsvector_update_trigger(searchVector, 'pg_catalog.english', title, description);

CREATE INDEX idx_searchVector ON "Workflow" USING GIN(searchVector);
```

**Why:** O(log n) search performance even with millions of workflows

#### 2. Tags as Array
```prisma
tags String[] // Array field, not separate junction table
```

**Why:**
- Tags aren't separately managed entities
- Array reduces query complexity
- PostgreSQL efficiently indexes arrays
- Easier filtering and pagination

#### 3. Denormalized Analytics
```prisma
model WorkflowAnalytics {
  embedViews: Int
  publicViews: Int
  downloads: Int
}
```

**Why:**
- Avoids COUNT aggregations on large tables
- Direct access to metrics
- Minimal overhead to maintain

#### 4. Audit Trail
```prisma
model AuditLog {
  action: String
  resource: String
  resourceId: String
  userId: String
  details: Json
}
```

**Why:**
- Compliance and security
- Detects unauthorized access
- Tracks all modifications
- JSON details for context

### Indexing Strategy

```prisma
// Frequently filtered fields
@@index([adminId])
@@index([isPublished])
@@index([category])
@@index([difficulty])
@@index([slug])
@@index([createdAt])

// Authentication
@@index([email])  // AdminUser
@@index([apiKey]) // AdminUser

// Full-text search (separate index)
@@fulltext([title, description])
```

## 🔄 API Design Principles

### RESTful Design

```
GET    /api/v1/workflows              # List with filters
POST   /api/v1/workflows              # Create (admin)
GET    /api/v1/workflows/:slug        # Details
PUT    /api/v1/workflows/:id          # Update (admin)
DELETE /api/v1/workflows/:id          # Delete (admin)

GET    /api/v1/workflows/featured     # Featured list
GET    /api/v1/workflows/:slug/json   # Download JSON
POST   /api/v1/workflows/:slug/reviews# Add review

GET    /api/v1/admin/workflows        # Admin list
GET    /api/v1/admin/stats            # Statistics

POST   /api/v1/admin/login            # Authentication
GET    /api/v1/embed/:slug            # Lightweight embed
GET    /api/v1/embed/:slug/script     # Embed script
```

### Response Format

Consistent response structure:

```json
{
  "statusCode": 200,
  "data": {...},
  "pagination": {...},
  "message": "Optional message"
}
```

**Rationale:**
- Uniform parsing on frontend
- Error handling is predictable
- Versioning friendly

### Pagination Design

```json
"pagination": {
  "page": 1,
  "limit": 20,
  "total": 100,
  "totalPages": 5,
  "hasNext": true,
  "hasPrev": false
}
```

**Rationale:**
- Cursor-less pagination (simple)
- Total count provides UI context
- Boolean flags for navigation

## 🔐 Security Architecture

### Authentication Flow

```
1. User submits credentials → POST /admin/login
2. Backend hashes password with bcryptjs
3. Compares with stored hash (constant-time)
4. Returns JWT token on success
5. Client stores token (HTTP-only cookie preferred)
6. All admin requests include token in Authorization header
7. Middleware verifies token signature and expiration
```

### Password Security

```typescript
// Hashing
const salt = await bcrypt.genSalt(12);
const hashed = await bcrypt.hash(password, salt);

// Verification (constant-time)
const valid = await bcrypt.compare(inputPassword, hashed);
```

**Why bcryptjs:**
- Adaptive hashing (slows as computers get faster)
- 12 rounds = ~100ms on modern hardware
- Constant-time comparison prevents timing attacks

### Input Validation Layers

```
1. Frontend: Vue form validation (UX)
   ↓
2. HTTP transmission: HTTPS/TLS
   ↓
3. Backend Zod schema: Parse & validate
   ↓
4. Sanitization: DOMPurify for HTML
   ↓
5. ORM: Prisma prevents SQL injection
   ↓
6. Database: Constraints and triggers
```

### CORS Security

```typescript
// Only allow specific origins
await fastify.register(cors, {
  origin: ['https://your-domain.com', 'https://wordpress.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
});
```

**Why:** Prevents unauthorized cross-origin requests

## ⚡ Performance Architecture

### Code Splitting

**Vue Router lazy loading:**
```typescript
const Home = () => import('@pages/Home.vue');
const Admin = () => import('@pages/Admin.vue'); // Only loaded when navigating to /admin
```

**Vite bundle optimization:**
```javascript
// vendor code splits
manualChunks: {
  'vue-flow': ['vue-flow-lib'],
  'admin': ['Admin components'],
}
```

**Result:** Initial bundle ~80KB (gzipped)

### Caching Strategy

```
Browser Cache (30 days):
  - Static assets (.js, .css, images)
  
Server Cache Headers:
  - Workflows list: max-age=300 (5 min)
  - Single workflow: max-age=600 (10 min)
  - Admin routes: no-cache (always fresh)

Database Indexes:
  - Search queries use tsvector GIN index
  - Category filtering uses B-tree index
  - Created date for sorting
```

### Database Query Optimization

```typescript
// Efficient pagination
const [data, total] = await Promise.all([
  prisma.workflow.findMany({ skip, take, where, select: {...} }),
  prisma.workflow.count({ where })
]);

// Select only needed fields
select: {
  id: true,
  title: true,
  slug: true,
  // Don't select large JSON
}
```

## 🧩 Component Architecture

### WorkflowCanvas Component

**Purpose:** Render n8n workflow as visual graph

**Design:**
```vue
<template>
  <svg>
    <!-- Connections (drawn first, below nodes) -->
    <line v-for="conn in connections" />
    
    <!-- Nodes (drawn on top) -->
    <g v-for="node in nodes">
      <!-- Rectangle, labels, metadata -->
    </g>
  </svg>
</template>

<script setup>
const { nodes, connections } = useWorkflowRenderer(workflow);
</script>
```

**Why SVG:**
- Lightweight (no Vue Flow library)
- Scalable (zoom, pan)
- Easily customizable
- No external dependencies

### Pinia Store Design

**Workflows Store:**
```typescript
// State: centralized data
const workflows = ref([])
const filters = ref({})
const pagination = ref({})

// Computed: derived state
const hasWorkflows = computed(() => workflows.value.length > 0)

// Actions: mutations
async function fetchWorkflows(filters) { ... }
```

**Why Pinia:**
- Lighter than Vuex
- Auto-generated getters/setters
- Better TypeScript support
- Easier to test

## 📊 Monitoring Architecture

### Request Logging

```
Every request logged with:
- Timestamp
- Method & Path
- IP Address
- User Agent
- Response status
- Response time
```

### Error Tracking

```
Errors logged with:
- Error message & stack
- Affected service
- Request context
- User information (if admin)
```

### Analytics

```
Track:
- Workflow views
- Workflow downloads
- Popular workflows
- User engagement
```

## 🚀 Deployment Architecture

### Container Design

```dockerfile
# Multi-stage builds for small image size
FROM node:18-alpine AS builder
RUN npm ci && npm run build

FROM node:18-alpine AS runtime
COPY --from=builder /app/dist ./dist
RUN npm ci --only=production
CMD ["node", "dist/index.js"]
```

**Result:** ~200MB final image (vs ~1GB with node_modules)

### Network Architecture

```
External Traffic
      ↓
   [TLS/SSL Termination]
      ↓
   [Reverse Proxy - Traefik/Nginx]
      ↓
   [Rate Limiting]
      ↓
   [Static Files] ← nginx
   [API Routes] ← Fastify
      ↓
   [Database] ← PostgreSQL
```

### Scalability Considerations

**Horizontal Scaling:**
1. Multiple Fastify instances behind load balancer
2. PostgreSQL as central state
3. Redis for session/cache (future)

**Vertical Scaling:**
1. Increased container resources
2. Database read replicas
3. Caching layer

## 📈 Future Enhancements

1. **GraphQL** - Consider adding GraphQL endpoint alongside REST
2. **WebSocket** - Real-time collaboration
3. **Redis Cache** - Session and view caching
4. **Message Queue** - Background jobs (email, exports)
5. **Elasticsearch** - Advanced search
6. **Microservices** - Split admin/public into separate services
7. **CDN** - Static asset distribution
8. **API Gateway** - Rate limiting, routing, auth

## 🔍 Decision Matrix

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend | Vue 3 | 小 bundle, great DX, TypeScript support |
| State Management | Pinia | Lighter than Vuex, better TS |
| Backend | Fastify | Fast, lightweight, smaller memory |
| ORM | Prisma | Type-safe, intuitive, great migrations |
| Validation | Zod | Runtime validation, excellent DX |
| DB | PostgreSQL | ACID, JSON support, full-text search |
| Auth | JWT | Stateless, scalable, standard |
| Hash | bcryptjs | Adaptive, resistant to timing attacks |
| Containerization | Docker | Reproducible, industry standard |

---

**Last Updated:** 2024
**Version:** 1.0.0
