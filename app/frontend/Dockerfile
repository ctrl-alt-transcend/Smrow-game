# ---- dev (watch, hot-reload Vite) ----
FROM node:22-alpine AS dev
WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
COPY shared/package.json ./shared/

RUN npm ci

COPY shared/ ./shared/
COPY frontend/ ./frontend/

# Compile shared
RUN npm run build -w shared

EXPOSE 5173
ENTRYPOINT ["npm"]
CMD ["run", "dev", "--workspace", "frontend", "--", "--host", "0.0.0.0"]

# ---- build prod (Vite) ----
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=dev /app ./
RUN npm run build --workspace frontend    # → /app/frontend/dist

FROM nginx:1.31-alpine AS runner
COPY frontend/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]