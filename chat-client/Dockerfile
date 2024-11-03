# Étape 1 : Construire l'application
# Utiliser une image de Node pour construire l'application
FROM node:16 AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier le fichier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tout le code source dans le conteneur
COPY . .

# Construire l'application
RUN npm run build

# Étape 2 : Configurer le serveur pour servir l'application
# Utiliser une image nginx pour servir les fichiers statiques
FROM nginx:alpine

# Copier les fichiers de build générés à l'étape précédente dans le répertoire de NGINX
COPY --from=build /app/build /usr/share/nginx/html

# Copier le fichier de configuration NGINX personnalisé
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer les ports HTTP et HTTPS
EXPOSE 80 443

# Démarrer NGINX
CMD ["nginx", "-g", "daemon off;"]
