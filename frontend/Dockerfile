# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve stage
FROM nginx:1.29.5-alpine3.23
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["node", "dist/index.js"]


