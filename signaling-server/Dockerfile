# Utilise l'image Node.js officielle
FROM node:18

# Crée un dossier dans le conteneur
WORKDIR /usr/src/app

# Copie le package.json et installe les dépendances
COPY package*.json ./
RUN npm install

# Copie le code de l'application
COPY . .

# Expose le port 4000
EXPOSE 4000

# Commande pour démarrer le serveur
CMD ["node", "index.js"]
