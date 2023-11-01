# Fase di compilazione
FROM node:20.9.0-alpine AS build
WORKDIR /ologami-backend
RUN apk update && apk add bind-tools
COPY package*.json ./
RUN apk add --no-cache yarn && \
    yarn install
COPY . .
COPY .env .env
RUN yarn run build

# Fase di esecuzione
FROM node:20.9.0-alpine
WORKDIR /ologami-backend
RUN apk update && apk add bind-tools
COPY package*.json ./
RUN apk add --no-cache yarn && \
    yarn install --production
COPY --from=build /ologami-backend/dist ./dist
COPY .env .env
EXPOSE 3000
CMD ["yarn", "run", "start"]
