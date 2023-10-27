FROM node:14
WORKDIR /ologami
RUN apt-get update && apt-get install -y dnsutils
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
