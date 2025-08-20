FROM node:20-alpine AS base
WORKDIR /app
COPY gateway/package.json gateway/package-lock.json* ./
RUN npm install --production

# Build frontend and copy its dist into gateway public folder
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY ../frontend/package.json ../frontend/package-lock.json* ./
RUN npm install
COPY ../frontend .
RUN npm run build

FROM base AS runtime
WORKDIR /app
COPY gateway/src ./src
COPY --from=frontend-build /frontend/dist ./public
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node","src/index.js"]
