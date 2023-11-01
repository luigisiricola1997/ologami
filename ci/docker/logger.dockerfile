FROM node:20.9.0-alpine
WORKDIR /logger
COPY . .
RUN apk add --no-cache yarn && \
    yarn install
CMD ["node", "/logger/logger.js"]
