FROM node:16
WORKDIR /api_suscripciones
COPY package*.json ./
RUN npm install
COPY . .
CMD [ "npm" ,"run", "serve","--port 8000" ]





