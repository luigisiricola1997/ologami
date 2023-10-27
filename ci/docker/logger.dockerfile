FROM node:14
WORKDIR /logger
COPY . .
RUN npm install
CMD ["node", "/logger/logger.js"]
