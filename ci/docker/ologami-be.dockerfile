FROM node:20.9.0-alpine AS build
WORKDIR /ologami-backend
RUN apk update && apk add bind-tools
COPY package*.json ./
RUN apk add --no-cache yarn && \
    yarn install --frozen-lockfile
COPY . .
RUN yarn run build

FROM node:20.9.0-alpine
WORKDIR /ologami-backend
RUN apk update && apk add bind-tools
COPY package*.json ./
RUN apk add --no-cache yarn && \
    yarn install --production
COPY --from=build /ologami-backend/dist ./dist
EXPOSE 3000
CMD ["yarn", "run", "start"]
