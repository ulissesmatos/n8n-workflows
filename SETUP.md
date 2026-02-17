# 🚀 Setup Local - Windows

Este guia explica como configurar e rodar o projeto localmente no Windows sem usar Docker/WSL.

## Pré-requisitos

Antes de começar, instale:

1. **Node.js 18+** - [Baixe aqui](https://nodejs.org/)
2. **PostgreSQL 13+** - [Baixe aqui](https://www.postgresql.org/download/windows/)
3. **Git** - [Baixe aqui](https://git-scm.com/download/win)

## 1. Instalação do PostgreSQL

1. Execute o instalador do PostgreSQL
2. Durante a instalação, defina uma senha para o usuário `postgres` (lembre-se dela!)
3. Mantenha a porta padrão `5432`
4. Após a instalação, abra o pgAdmin ou psql

### Criar o banco de dados

Abra o psql ou pgAdmin e execute:

```sql
CREATE DATABASE n8n_workflow_library;
```

## 2. Configurar o Backend

### 2.1. Instalar dependências

Abra o PowerShell ou CMD na pasta do projeto:

```powershell
cd backend
npm install
```

### 2.2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```powershell
copy .env.example .env
```

Edite o arquivo `backend\.env` com suas configurações:

```env
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/n8n_workflow_library?schema=public"

# JWT
JWT_SECRET=sua-chave-secreta-super-segura-aqui-minimo-32-caracteres

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# Admin (primeiro usuário)
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=Admin123!@#
```

**⚠️ IMPORTANTE:** 
- Substitua `SUA_SENHA` pela senha do PostgreSQL que você definiu
- Altere o `JWT_SECRET` para uma string aleatória longa
- Altere as credenciais do admin

### 2.3. Executar migrations do banco de dados

```powershell
npx prisma generate
npx prisma migrate dev --name init
```

### 2.4. (Opcional) Popular com dados de exemplo

Crie o arquivo `backend\prisma\seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Criar admin
  const hashedPassword = await bcrypt.hash('Admin123!@#', 12);
  const admin = await prisma.adminUser.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
    },
  });

  console.log('✅ Admin criado:', admin.email);

  // Criar workflow de exemplo
  const workflow = await prisma.workflow.create({
    data: {
      title: 'Webhook to Email Notification',
      slug: 'webhook-to-email',
      description: 'Recebe um webhook e envia notificação por email',
      category: 'Webhook',
      difficulty: 'easy',
      author: 'Admin',
      version: '1.0.0',
      tags: ['webhook', 'email', 'notification'],
      jsonData: {
        nodes: [
          {
            id: 'webhook',
            type: 'n8n-nodes-base.webhook',
            name: 'Webhook',
            position: [250, 300],
          },
          {
            id: 'email',
            type: 'n8n-nodes-base.emailSend',
            name: 'Send Email',
            position: [450, 300],
          },
        ],
        connections: {
          webhook: {
            main: [[{ node: 'email', type: 'main', index: 0 }]],
          },
        },
      },
      isPublished: true,
      isFeatured: true,
      adminId: admin.id,
    },
  });

  console.log('✅ Workflow criado:', workflow.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Execute o seed:

```powershell
npm install -D tsx
npx tsx prisma/seed.ts
```

### 2.5. Iniciar o servidor backend

```powershell
npm run dev
```

O backend iniciará em `http://localhost:3000`

## 3. Configurar o Frontend

Abra um **novo terminal** PowerShell/CMD:

### 3.1. Instalar dependências

```powershell
cd frontend
npm install
```

### 3.2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```powershell
copy .env.example .env
```

Edite o arquivo `frontend\.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

### 3.3. Iniciar o servidor frontend

```powershell
npm run dev
```

O frontend iniciará em `http://localhost:5173`

## 4. Acessar a Aplicação

- **Frontend público:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Admin login:** http://localhost:5173/login
  - Email: `admin@example.com`
  - Senha: `Admin123!@#` (ou a que você definiu)

## 5. Estrutura de Comandos

### Backend

```powershell
cd backend

# Instalar dependências
npm install

# Gerar Prisma Client
npx prisma generate

# Rodar migrations
npx prisma migrate dev

# Ver banco de dados no browser
npx prisma studio

# Modo desenvolvimento (hot reload)
npm run dev

# Build para produção
npm run build

# Rodar produção
npm start
```

### Frontend

```powershell
cd frontend

# Instalar dependências
npm install

# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Type checking
npm run type-check
```

## 6. Solução de Problemas

### Erro: "Cannot find module 'fastify'"

```powershell
cd backend
npm install
```

### Erro: "Cannot connect to PostgreSQL"

1. Verifique se o PostgreSQL está rodando:
   - Abra "Serviços" do Windows (Win + R → `services.msc`)
   - Procure por "postgresql-x64-13" (ou sua versão)
   - Status deve estar "Em execução"

2. Verifique a `DATABASE_URL` no arquivo `backend\.env`

3. Teste a conexão:
```powershell
psql -U postgres -h localhost
# Digite a senha quando solicitado
```

### Erro: "Port 3000 already in use"

```powershell
# Encontrar processo usando a porta
netstat -ano | findstr :3000

# Matar o processo (substitua PID pelo número encontrado)
taskkill /PID <PID> /F
```

### Erro: "Port 5173 already in use"

```powershell
# Encontrar processo usando a porta
netstat -ano | findstr :5173

# Matar o processo
taskkill /PID <PID> /F
```

### TypeScript errors durante npm install

Execute:

```powershell
# Backend
cd backend
npm install --legacy-peer-deps
npm install -D @types/node

# Frontend
cd frontend
npm install --legacy-peer-deps
```

### Erro de CORS

Certifique-se de que `backend\.env` tem:

```env
ALLOWED_ORIGINS=http://localhost:5173
```

E reinicie o backend.

## 7. Próximos Passos

1. ✅ Certifique-se de que backend e frontend estão rodando
2. ✅ Faça login no admin (`/login`)
3. ✅ Crie workflows no painel admin (`/admin/workflows`)
4. ✅ Publique workflows e marque como featured
5. ✅ Visualize no frontend público

## 8. Ambiente de Produção

Quando estiver pronto para deploy em produção, consulte:

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deploy com Docker
- [SECURITY.md](./SECURITY.md) - Best practices de segurança
- [WORDPRESS_INTEGRATION.md](./WORDPRESS_INTEGRATION.md) - Integração com WordPress

## 9. Suporte

Se encontrar problemas:

1. Verifique os logs do backend (terminal onde rodou `npm run dev`)
2. Verifique o console do browser (F12)
3. Consulte a documentação da API em [API.md](./API.md)
4. Verifique erros do TypeScript: `npm run type-check`

---

**Desenvolvido com ❤️ usando Vue 3 + Fastify + PostgreSQL**
