FROM node:22-alpine AS dev
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY --exclude=nginx frontend/ ./
COPY shared/ /app/shared
EXPOSE 5173
ENTRYPOINT ["npm"]
CMD ["run", "dev", "--", "--host", "0.0.0.0"]

FROM node:22-alpine AS builder
WORKDIR /app/backend
COPY --exclude=config --from=dev /app ./
COPY --from=dev /app/config/ ./
RUN ls -la && pwd
RUN npm run build


#INFO: the image gonna be used to run the application
#
FROM nginx:1.31.6-alpine AS runner
COPY frontend/nginx/nginx.conf /etc/nginx/conf.d/nginx.conf
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
EXPOSE 5173
ENTRYPOINT ["nginx", "-g", "daemon off;"]


