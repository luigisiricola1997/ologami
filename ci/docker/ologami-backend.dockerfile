FROM node:20.9.0-alpine
WORKDIR /ologami-backend
RUN apk update && apk add bind-tools
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
