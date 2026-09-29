FROM node:22-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY --exclude=nginx . .
EXPOSE 5173
ENTRYPOINT ["npm"]
CMD ["run", "dev"]

FROM node:22-alpine AS builder
WORKDIR /app
COPY --exclude=config --from=dev /app ./
COPY --from=dev /app/config/ ./
RUN ls -la && pwd
RUN npm run build


#INFO: the image gonne be used to run the application
#
FROM nginx:1.31.6-alpine AS runner
WORKDIR /etc/nginx
COPY ./nginx/nginx.conf /etc/nginx/conf.d/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 5173
ENTRYPOINT ["nginx", "-g", "daemon off;"] 


