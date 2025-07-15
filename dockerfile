FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

VOLUME ["/app/config", "/app/data"]

EXPOSE 8081

CMD ["node", "index.js", "-allowenvless"]