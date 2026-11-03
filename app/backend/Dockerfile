#INFO: Use multi-stage builds to reduce image size and better optimize caching
# Using npm-ci instead of 'npm install' is better practice for production
# more explaination here: https://stackoverflow.com/questions/52499617/what-is-the-difference-between-npm-install-and-npm-ci

FROM node:26-alpine AS dev

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY shared/package.json ./shared/

RUN npm ci

COPY backend/ ./backend/
COPY shared/ ./shared/

WORKDIR /app/backend
RUN npx prisma generate

EXPOSE 3000
ENTRYPOINT ["npm"]
CMD ["run", "start:dev"]
EXPOSE 3000
EXPOSE 3001

#INFO: build for production
#
FROM node:26-alpine AS builder
WORKDIR /app
COPY --from=dev /app ./
#RUN npx prisma generate
RUN npm run build

#INFO: Remove dev dependencies to reduce image size
#
FROM node:26-alpine AS pruner
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY shared/package.json ./shared/
COPY prisma ./prisma
RUN npm ci --omit=dev \
    && npm cache clean --force && npx prisma generate

#INFO: the image gonne be used to run the application
#
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nestjs && \
    adduser -S nestjs -u 1001
COPY --from=pruner /app/node_modules ./node_modules
COPY --from=pruner /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=pruner /app/generated ./generated
COPY --from=builder /app/dist ./dist
USER nestjs
CMD ["node", "/app/dist/src/main.js"]
EXPOSE 3000
EXPOSE 3001

