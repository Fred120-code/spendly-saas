FROM node:20-alpine


#Métadonnées
LABEL maintainer="fredayemtsa@gmail.com"
LABEL version="1.0"

#Répertoire de travail
WORKDIR /

#copie des fichers de dependances
COPY package*.json ./

#installation des dependances
RUN npm install

#copie le reste du code
COPY . .

#exposer le port
EXPOSE 3000

#

