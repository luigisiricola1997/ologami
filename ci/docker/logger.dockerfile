FROM node:20.9.0-alpine
WORKDIR /logger
COPY . .
RUN npm install
CMD ["node", "/logger/logger.js"]
