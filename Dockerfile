FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine AS backend-build
WORKDIR /app/backend
RUN apk add --no-cache python3 make g++
COPY backend/package*.json ./
RUN npm install --omit=dev

FROM node:20-alpine
RUN apk add --no-cache libstdc++
WORKDIR /app
COPY --from=backend-build /app/backend/node_modules ./backend/node_modules
COPY backend/ ./backend/
COPY --from=frontend-build /app/frontend/dist ./frontend/dist
RUN mkdir -p /data
ENV DB_PATH=/data/chefcost.db
ENV PORT=8080
EXPOSE 8080
CMD ["node", "backend/src/index.js"]
