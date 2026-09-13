FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests first for layer caching
COPY package*.json ./

RUN npm install --omit=dev

# Copy server code
COPY . .

EXPOSE 5001

CMD ["node", "server.js"]
