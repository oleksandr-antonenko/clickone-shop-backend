# Minimal production runtime (expects local build)
FROM node:20-alpine

WORKDIR /app

# Security: run as non-root
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

ENV NODE_ENV=production
ENV PORT=3030

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production --silent && npm cache clean --force

# Copy only compiled output
COPY dist/ ./dist/

USER nestjs

EXPOSE 3030
CMD ["node", "dist/main"] 