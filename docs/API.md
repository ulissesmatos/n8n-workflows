# API Documentation

Complete REST API reference for the n8n Workflow Library.

## 📍 Base URL

```
https://your-domain.com/api/v1
```

## 🔐 Authentication

### JWT Bearer Token

Admin endpoints require authentication via JWT bearer token:

```
Authorization: Bearer <your-jwt-token>
```

### Obtaining a Token

**Endpoint:** `POST /admin/login`

```bash
curl -X POST https://your-domain.com/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "securepassword"
  }'
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "user_123",
      "email": "admin@example.com"
    }
  }
}
```

## 📖 Public Endpoints

### Get All Workflows (with Filters)

**Endpoint:** `GET /workflows`

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | number | No | 1 | Page number for pagination |
| limit | number | No | 20 | Items per page (max 100) |
| search | string | No | - | Full-text search query |
| category | string | No | - | Filter by category |
| difficulty | string | No | - | Filter by difficulty (easy, medium, hard) |
| tags | string | No | - | Comma-separated tags to filter |
| sort | string | No | newest | Sort order (newest, popular, rating) |
| featured | boolean | No | - | Show only featured workflows |

**Example:**
```bash
curl "https://your-domain.com/api/v1/workflows?search=webhook&difficulty=easy&limit=10"
```

**Response:**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "wf_123",
      "title": "Send Email Webhook",
      "slug": "send-email-webhook",
      "description": "Send emails via webhook trigger",
      "category": "Integration",
      "difficulty": "easy",
      "tags": ["email", "webhook", "integration"],
      "author": "John Doe",
      "viewCount": 245,
      "rating": 4.5,
      "thumbnailUrl": "https://...",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T14:22:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Get Featured Workflows

**Endpoint:** `GET /workflows/featured`

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| limit | number | No | 6 | Number of featured workflows |

**Response:** Same as `/workflows` but limited to featured items

### Get Workflow by Slug

**Endpoint:** `GET /workflows/{slug}`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| slug | string | URL-friendly workflow identifier |

**Example:**
```bash
curl https://your-domain.com/api/v1/workflows/send-email-webhook
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "id": "wf_123",
    "title": "Send Email Webhook",
    "slug": "send-email-webhook",
    "description": "Send emails via webhook trigger...",
    "content": "<h2>How to use...</h2>",
    "category": "Integration",
    "difficulty": "easy",
    "tags": ["email", "webhook"],
    "author": "John Doe",
    "version": "1.0.0",
    "viewCount": 246,
    "downloadCount": 42,
    "rating": 4.5,
    "thumbnailUrl": "https://...",
    "isPublished": true,
    "isFeatured": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:22:00Z"
  }
}
```

### Download Workflow JSON

**Endpoint:** `GET /workflows/{slug}/json`

Downloads the workflow as a JSON file for import into n8n.

**Example:**
```bash
curl -O https://your-domain.com/api/v1/workflows/send-email-webhook/json
```

**Response:** Raw JSON file (application/json)

### Add Review

**Endpoint:** `POST /workflows/{slug}/reviews`

**Request Body:**
```json
{
  "rating": 5,
  "comment": "Great workflow, very helpful!",
  "userEmail": "user@example.com"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "id": "review_123",
    "workflowId": "wf_123",
    "rating": 5,
    "comment": "Great workflow, very helpful!",
    "userEmail": "user@example.com",
    "isApproved": false,
    "createdAt": "2024-01-21T15:30:00Z"
  }
}
```

## 🔐 Admin Endpoints

All admin endpoints require JWT authentication and `Authorization` header.

### Admin Login

**Endpoint:** `POST /admin/login`

See [Obtaining a Token](#obtaining-a-token) above.

### Create Workflow

**Endpoint:** `POST /admin/workflows`

**Request Body:**
```json
{
  "title": "New Webhook Integration",
  "slug": "new-webhook-integration",
  "description": "A new webhook integration workflow",
  "content": "<p>Detailed instructions...</p>",
  "category": "Integration",
  "difficulty": "medium",
  "tags": ["webhook", "api", "integration"],
  "author": "Admin User",
  "version": "1.0.0",
  "jsonData": {
    "nodes": [
      {
        "id": "node1",
        "name": "Webhook",
        "type": "n8n-nodes-base.webhook",
        "position": [100, 100]
      }
    ],
    "connections": []
  },
  "isPublished": false,
  "isFeatured": false
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "id": "wf_124",
    "title": "New Webhook Integration",
    "slug": "new-webhook-integration",
    ...
  }
}
```

### Get Admin Workflows

**Endpoint:** `GET /admin/workflows`

**Query Parameters:** Same as public workflows endpoint

**Response:** Same pagination format as public workflows

### Get Single Admin Workflow

**Endpoint:** `GET /admin/workflows/{id}`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Workflow ID (not slug) |

**Response:** Full workflow object with all details

### Update Workflow

**Endpoint:** `PUT /admin/workflows/{id}`

**Request Body:** Any fields to update (all fields optional)

```json
{
  "title": "Updated Title",
  "isPublished": true,
  "isFeatured": true
}
```

**Response:** Updated workflow object

### Delete Workflow

**Endpoint:** `DELETE /admin/workflows/{id}`

**Response:**
```json
{
  "statusCode": 200,
  "message": "Workflow deleted successfully"
}
```

### Get Dashboard Statistics

**Endpoint:** `GET /admin/stats`

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "totalWorkflows": 24,
    "publishedWorkflows": 18,
    "totalViews": 1523,
    "totalDownloads": 342
  }
}
```

## 🔗 Embed Endpoints

### Get Workflow for Embed

**Endpoint:** `GET /embed/{slug}`

Lightweight endpoint for WordPress embed retrieval.

**Response:** Minimal workflow data (no analytics)

### Get Embed Script

**Endpoint:** `GET /embed/{slug}/script`

Returns JavaScript embed script for WordPress integration.

**Response:** JavaScript file that creates an embed container

### Get Embed Styles

**Endpoint:** `GET /styles/embed.css`

Returns CSS for embed styling.

**Response:** CSS file

## 💨 Health & Status

### Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "statusCode": 200,
  "status": "healthy",
  "timestamp": "2024-01-21T15:30:00Z"
}
```

## 🔍 Error Responses

### Error Format

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Error description"
}
```

### Common Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 400 | Bad Request | Invalid parameters or payload |
| 401 | Unauthorized | Missing or invalid authentication token |
| 404 | Not Found | Workflow or resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

**Example Error Response:**
```json
{
  "statusCode": 404,
  "message": "Workflow not found"
}
```

## 📊 Rate Limiting

Rate limit: **100 requests per 15 minutes** per IP address

**Headers in Response:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1705857000
```

## 🔄 Pagination

### Request

```bash
curl "https://your-domain.com/api/v1/workflows?page=2&limit=20"
```

### Response

```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": true
  }
}
```

## 📋 Workflow JSON Schema

The `jsonData` field must match this format:

```json
{
  "nodes": [
    {
      "id": "node_uuid",
      "name": "Node Name",
      "type": "n8n-nodes-base.nodeType",
      "position": [x, y],
      "parameters": {
        "param1": "value1"
      },
      "outputCount": 1
    }
  ],
  "connections": [
    {
      "from": "source_node_id",
      "to": "target_node_id"
    }
  ]
}
```

## 📝 Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Successful read |
| 201 | Created - Successful create |
| 204 | No Content - Successful delete |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Auth required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

## 🔗 Filtering Examples

### Search and Filter

```bash
# Search and filter by category
curl "https://your-domain.com/api/v1/workflows?search=email&category=Integration"

# Filter by multiple tags
curl "https://your-domain.com/api/v1/workflows?tags=webhook,api,automation"

# Sort by popularity
curl "https://your-domain.com/api/v1/workflows?sort=popular&limit=10"

# Get only easy workflows
curl "https://your-domain.com/api/v1/workflows?difficulty=easy"

# Get featured workflows
curl "https://your-domain.com/api/v1/workflows?featured=true"
```

## 🧪 Testing the API

### Using cURL

```bash
# Get all workflows
curl https://your-domain.com/api/v1/workflows

# Get single workflow
curl https://your-domain.com/api/v1/workflows/workflow-slug

# Login
curl -X POST https://your-domain.com/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Create workflow (requires token)
curl -X POST https://your-domain.com/api/v1/admin/workflows \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{...}'
```

### Using Postman

1. Import API from specification
2. Set `{{baseUrl}}` variable to your domain
3. Use auth token in headers
4. Test each endpoint

### Using Thunder Client / Insomnia

Similar to Postman - import JSON spec and test.

## 📚 Resources

- [Main README](../README.md)
- [WordPress Integration](./WORDPRESS_INTEGRATION.md)
- [Security Guide](./SECURITY.md)
- [Architecture](./ARCHITECTURE.md)

---

**API Version:** 1.0.0
**Last Updated:** 2024
