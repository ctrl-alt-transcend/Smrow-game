# syntax=docker/dockerfile:1
#INFO: Use multi-stage builds to reduce image size and better optimize caching
# Using npm-ci instead of 'npm install' is better practice for production
# more explaination here: https://stackoverflow.com/questions/52499617/what-is-the-difference-between-npm-install-and-npm-ci

FROM node:26-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY /backend/package.json ./backend/
COPY shared/package.json ./shared/
RUN  --mount=type=cache,target=/root/.npm npm ci --workspace=backend --workspace=shared --include-workspace-root


FROM deps AS dev

WORKDIR /app

COPY shared/ ./shared/
COPY backend/ ./backend/
# Compile shared
RUN npm run build -w shared

WORKDIR /app/backend
RUN npx prisma generate
EXPOSE 3000 3001
ENTRYPOINT ["npm"]
CMD ["run", "start:dev"]

#INFO: build for production
#
FROM dev AS builder
WORKDIR /app
# Compile shared
RUN npm run build -w backend

#INFO: remove dev dependencies to reduce image size
RUN npm prune --omit=dev --workspace=backend --workspace=shared --include-workspace-root

#INFO: the image that is gonna  be used to run the application
#
FROM node:26-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NODE_OPTIONS="--dns-result-order=ipv4first"
RUN addgroup -g 1001 -S nestjs && adduser -S nestjs -u 1001 && \
mkdir -p /app/backend/uploads/avatars && chown -R nestjs:nestjs /app/backend/uploads

#copy compiled production dependencies
COPY --from=builder --chown=nestjs:nestjs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nestjs /app/backend/node_modules ./backend/node_modules


#copy the shared dependencies
COPY --from=builder /app/shared/package.json ./shared/package.json
COPY --from=builder /app/shared/dist ./shared/dist

COPY --from=builder --chown=nestjs:nestjs /app/backend/package.json ./backend/package.json
COPY --from=builder --chown=nestjs:nestjs /app/backend/dist ./backend/dist
COPY --from=builder --chown=nestjs:nestjs /app/backend/src/strategies ./backend/src/strategies
COPY --from=builder --chown=nestjs:nestjs /app/backend/src/config ./backend/src/config
COPY --from=builder --chown=nestjs:nestjs /app/backend/prisma ./backend/prisma
COPY --from=builder --chown=nestjs:nestjs /app/backend/prisma7.config.ts ./backend/prisma7.config.ts


WORKDIR /app/backend
USER nestjs
EXPOSE 3000 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]

