# Multi-stage build for backend
FROM node:18-alpine AS backend-builder
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/src ./src
COPY backend/tsconfig.json ./
COPY backend/prisma ./prisma
RUN npm run build

# Production backend
FROM node:18-alpine AS backend
WORKDIR /app
ENV NODE_ENV=production
COPY backend/package*.json ./
RUN npm ci --only=production
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/prisma ./prisma
EXPOSE 3000
CMD ["node", "dist/index.js"]

# Frontend builder
FROM node:18-alpine AS frontend-builder
WORKDIR /app
ARG VITE_API_URL
ARG VITE_APP_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_URL=$VITE_APP_URL
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

# Production frontend (nginx)
FROM nginx:alpine AS frontend
COPY --from=frontend-builder /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
