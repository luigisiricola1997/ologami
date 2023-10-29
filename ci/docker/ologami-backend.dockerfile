FROM node:14
WORKDIR /ologami-backend
RUN apt update && apt install -y dnsutils
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
