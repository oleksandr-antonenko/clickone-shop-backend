# Build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

RUN apk add --no-cache python3 make g++
RUN npm install -g @nestjs/cli

COPY ../package*.json ./
RUN npm ci
COPY ../ ./
COPY .env .env
RUN npm run build
# Production stage
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Копіюємо лише необхідні файли
RUN npm prune --production
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./package.json
COPY .env .env

EXPOSE 3310

CMD ["npm", "run", "start"]

