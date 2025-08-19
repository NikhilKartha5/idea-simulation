FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# Install all deps (need dev deps for vite build)
RUN npm install

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
# Copy built app and all node modules (includes vite) for preview server
COPY --from=build /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json* ./
EXPOSE 5173
CMD ["npx","vite","preview","--host","0.0.0.0","--port","5173"]
