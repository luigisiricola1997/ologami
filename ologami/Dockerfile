# Utilizza un'immagine Node.js come base
FROM node:14

# Crea una directory di lavoro
WORKDIR /ologami

# Copia package.json e package-lock.json
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia il codice sorgente nel container
COPY . .

# Espone la porta 3000
EXPOSE 3000

# Comando per avviare l'applicazione
CMD ["npm", "start"]
