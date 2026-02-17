# n8n Workflow Library SaaS

A modern, production-ready public n8n workflow library and WordPress integration platform built with Vue 3, Fastify, and PostgreSQL.

## 📋 Overview

This is a comprehensive mini-SaaS application that:
- Displays a searchable, filterable catalog of n8n workflows
- Provides detailed workflow information and visual canvas preview
- Enables JSON download for workflow imports
- Offers embedded iframe integration for WordPress sites
- Includes a secure admin dashboard for workflow management
- Implements enterprise-grade security and performance optimization

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    WordPress Site                           │
│    (Embed iframe/script tag to display workflows)          │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
   ┌────▼────┐                  ┌────▼────┐
   │ Frontend │                  │ Reverse │
   │(Vue 3)   │ ◄────────────►  │ Proxy   │
   │SPA       │   (HTTP/HTTPS)  │(Traefik)│
   └────┬────┘                  └────┬────┘
        │                             │
        │  ┌───────────────────────────┤
        │  │                           │
   ┌────▼──▼──┐                  ┌────▼────┐
   │ Nginx    │                  │ Backend  │
   │(Static   │                  │(Fastify) │
   │Serving)  │                  │Node.js   │
   └──────────┘                  └────┬─────┘
                                      │
                                 ┌────▼────────┐
                                 │ PostgreSQL   │
                                 │  Database    │
                                 └──────────────┘
```

## 🚀 Tech Stack

### Frontend
- **Vue 3** with Composition API
- **Vite** for fast development and optimized builds
- **Pinia** for state management
- **Vue Router** for client-side routing with lazy loading
- **Typescript** for type safety
- **Axios** for HTTP requests
- **Custom SVG Canvas** for workflow visualization

### Backend
- **Node.js** 18+
- **Fastify** for high-performance API
- **Prisma ORM** for database operations
- **PostgreSQL** 13+ database
- **Zod** for runtime validation
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Helmet** for security headers
- **CORS** with pre-configured origins

### DevOps & Deployment
- **Docker** & **Docker Compose** for containerization
- **Traefik** for reverse proxy (production)
- **Nginx** for static asset serving
- **Let's Encrypt** for SSL/TLS certificates

## 📁 Project Structure

```
minisaas-wordpress/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Main server entry point
│   │   ├── routes/               # API route handlers
│   │   │   ├── workflows.ts      # Public workflows API
│   │   │   ├── admin.ts          # Admin protected routes
│   │   │   ├── embed.ts          # Embed routes for WordPress
│   │   │   └── health.ts         # Health check endpoint
│   │   ├── controllers/          # Request handlers
│   │   ├── services/             # Business logic
│   │   │   └── workflow.service.ts
│   │   ├── middleware/           # Auth & custom middleware
│   │   ├── schemas/              # Zod validation schemas
│   │   └── utils/                # Helper functions
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   └── migrations/           # Database migrations
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── main.ts               # Vue app entry point
│   │   ├── App.vue               # Root component
│   │   ├── components/           # Reusable components
│   │   │   └── WorkflowCanvas.vue # Workflow renderer
│   │   ├── pages/                # Page components
│   │   │   ├── Home.vue
│   │   │   ├── WorkflowList.vue
│   │   │   ├── WorkflowDetail.vue
│   │   │   ├── Admin/
│   │   │   ├── Login.vue
│   │   │   └── Embed.vue
│   │   ├── router/               # Vue Router config
│   │   ├── stores/               # Pinia stores
│   │   │   ├── workflows.ts
│   │   │   └── auth.ts
│   │   ├── composables/          # Vue 3 composables
│   │   ├── utils/                # Utilities
│   │   │   └── api.ts            # API client
│   │   ├── types/                # TypeScript types
│   │   └── styles/               # SCSS/CSS files
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.example
├── docker/
│   ├── Dockerfile                # Multi-stage Docker build
│   ├── docker-compose.yml        # Local & production setup
│   └── nginx.conf                # Nginx configuration
├── docs/
│   ├── ARCHITECTURE.md           # Architecture documentation
│   ├── WORDPRESS_INTEGRATION.md  # WordPress plugin guide
│   ├── DEPLOYMENT.md             # Deployment instructions
│   ├── SECURITY.md               # Security checklist
│   └── API.md                    # API documentation
├── .gitignore
├── CHANGELOG.md
└── README.md                     # This file
```

## ✨ Key Features

### Public Features
- ✅ Searchable workflow catalog
- ✅ Advanced filtering (category, difficulty, tags)
- ✅ Full-text search
- ✅ Pagination with customizable page size
- ✅ Workflow detail pages with visual canvas
- ✅ JSON download capability
- ✅ Rating and review system
- ✅ Embed support for WordPress sites

### Admin Features
- ✅ Secure login with JWT authentication
- ✅ Dashboard with statistics
- ✅ Create, read, update, delete workflows
- ✅ Bulk publish/unpublish
- ✅ Featured workflows management
- ✅ View analytics and download statistics
- ✅ Audit logging for compliance

### Technical Features
- ✅ Type-safe with TypeScript
- ✅ Code splitting & lazy loading
- ✅ Responsive design (mobile-first)
- ✅ Server-side caching headers
- ✅ Rate limiting
- ✅ Input validation & sanitization
- ✅ XSS protection
- ✅ CORS with origin restriction
- ✅ Secure password hashing
- ✅ Database indexing for performance
- ✅ Audit logging

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Docker & Docker Compose (for containerized setup)
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd minisaas-wordpress
   ```

2. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   # Edit files with your configuration
   ```

3. **Install dependencies**
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd ../frontend && npm install
   ```

4. **Setup database**
   ```bash
   cd ../backend
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

5. **Start development servers**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Documentation: See docs/API.md

### Docker Setup

```bash
# Local development with docker-compose
docker-compose -f docker-compose.yml up -d

# Production build
docker build -t minisaas:latest -f Dockerfile .
docker-compose -f docker-compose.yml --profile production up -d
```

## 📚 Documentation

- [Architecture Guide](docs/ARCHITECTURE.md) - Detailed architecture & design decisions
- [API Documentation](docs/API.md) - Complete API reference
- [WordPress Integration](docs/WORDPRESS_INTEGRATION.md) - Embedding workflows in WordPress
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment instructions
- [Security Checklist](docs/SECURITY.md) - Security best practices

## 🔒 Security Features

- ✅ **Helmet.js** - Secure HTTP headers
- ✅ **bcryptjs** - Password hashing with salting
- ✅ **JWT** - Token-based authentication
- ✅ **Zod** - Input validation
- ✅ **DOMPurify** - HTML sanitization
- ✅ **CORS** - Origin restriction
- ✅ **Rate Limiting** - DDoS protection
- ✅ **Content Security Policy** - XSS prevention
- ✅ **Audit Logging** - Compliance tracking
- ✅ **Environment Variables** - Secure configuration

## ⚡ Performance Optimizations

- ✅ **Code Splitting** - Lazy load routes & components
- ✅ **Compression** - Gzip for HTTP responses
- ✅ **Caching** - Browser and server-side caching
- ✅ **Database Indexing** - Optimized queries
- ✅ **Database Connection Pooling** - Prisma
- ✅ **Minimal Bundle** - Tree-shaking & optimization
- ✅ **CDN Ready** - Static asset optimization

## 🌐 WordPress Integration

Embed workflows in WordPress using iframe or script tag:

```html
<!-- Embed a specific workflow -->
<iframe 
  src="https://your-domain.com/#/embed/workflow-slug"
  width="100%"
  height="500"
  frameborder="0"
></iframe>

<!-- Or use the WordPress plugin (auto-generated) -->
[n8n_workflow slug="workflow-slug" height="500"]
```

See [WordPress Integration Guide](docs/WORDPRESS_INTEGRATION.md) for details.

## 📊 Database Schema Highlights

- **Workflows** - Core workflow data with full-text search
- **AdminUsers** - Secure admin authentication
- **WorkflowReviews** - User ratings and comments
- **WorkflowAnalytics** - Usage tracking
- **AuditLogs** - Security & compliance logging
- **Tags & Categories** - Workflow taxonomy

## 🛠️ Development Commands

### Backend
```bash
npm run dev           # Start dev server with hot reload
npm run build         # Build TypeScript
npm start            # Run built application
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
npm run lint         # Run linter
npm run type-check   # Check TypeScript types
```

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run type-check   # Check TypeScript types
npm run lint         # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🆘 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review API documentation

## 🗺️ Roadmap

- [ ] Advanced workflow templates
- [ ] Workflow versioning
- [ ] User comments & discussions
- [ ] Workflow forking
- [ ] Export to n8n Cloud
- [ ] Analytics dashboard
- [ ] Webhook integrations
- [ ] API rate limiting tiers
- [ ] Multi-language support
- [ ] Community marketplace

## 📞 Contact

Created with ❤️ for the n8n community

---

**Last Updated:** 2024
**Version:** 1.0.0
