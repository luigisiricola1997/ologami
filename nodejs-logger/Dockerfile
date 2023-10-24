FROM node:14
WORKDIR /nodejs-logger
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "/nodejs-logger/nodejs-logger.js"]
