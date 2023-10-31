FROM node:20.9.0-alpine AS builder
WORKDIR /ologami-backend
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20.9.0-alpine
WORKDIR /ologami-backend
COPY --from=builder /ologami-backend/dist ./dist
COPY package*.json ./
RUN npm install --only=production
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
