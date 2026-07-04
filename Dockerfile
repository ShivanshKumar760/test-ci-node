# ---------- Stage 1: deps ----------
# Installs only production dependencies, cached separately from source
# so this layer only re-runs when package.json / package-lock.json change.
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---------- Stage 2: runtime ----------
# Minimal final image: production node_modules + source only.
# No build tools, no devDependencies, no npm cache.
FROM node:20-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

# Run as a non-root user (alpine's built-in "node" user)
RUN chown -R node:node /app
USER node

COPY --chown=node:node --from=deps /app/node_modules ./node_modules
COPY --chown=node:node . .

EXPOSE 3000

# Lightweight liveness check hitting the /users endpoint since there's
# no dedicated /health route yet — swap this out if you add one.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/users').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "index.js"]