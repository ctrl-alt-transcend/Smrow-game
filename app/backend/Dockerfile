#INFO: Use multi-stage builds to reduce image size and better optimize caching
# Using npm-ci instead of 'npm install' is better practice for production
# more explaination here: https://stackoverflow.com/questions/52499617/what-is-the-difference-between-npm-install-and-npm-ci
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

#INFO: Remove dev dependencies to reduce image size
#
FROM node:22-alpine AS pruner
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

#INFO: the image gonne be used to run the application
#
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nestjs && \
    adduser -S nestjs -u 1001
COPY --from=pruner /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
USER nestjs
EXPOSE 3000
CMD ["node", "dist/src/main.js"]
