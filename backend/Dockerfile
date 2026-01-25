# Backend API Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dependances
COPY package*.json ./

# Installer les dependances
RUN npm ci

# Copier le code source
COPY tsconfig.json ./
COPY src/ ./src/

# Compiler TypeScript
RUN npm run build

# Image de production
FROM node:20-alpine AS production

WORKDIR /app

# Copier les fichiers de dependances
COPY package*.json ./

# Installer uniquement les dependances de production
RUN npm ci --only=production && npm cache clean --force

# Copier le code compile
COPY --from=builder /app/dist ./dist

# Creer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Exposer le port
EXPOSE 3001

# Demarrer l'application
CMD ["node", "dist/index.js"]
