FROM node:20-alpine
WORKDIR /app

# Copy dependency manifests first (layer cache)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY server.js ./
COPY public/ ./public/

# Copy the pre-processed XLSX data dump
COPY .bob/tmp/xlsx-dumps/ ./.bob/tmp/xlsx-dumps/

EXPOSE 3000
CMD ["node", "server.js"]
