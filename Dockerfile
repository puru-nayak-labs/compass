FROM node:20-alpine
WORKDIR /app

# ── Build argument ────────────────────────────────────────────────────────────
# DATA_SRC: path (relative to build context) of the xlsx-dumps folder to bake
# into the image.  Override with:
#   docker build --build-arg DATA_SRC=<your/path> -t ...
# Default matches the Bob-generated dump folder used in local dev.
ARG DATA_SRC=.bob/tmp/xlsx-dumps/TLS Performance Data-e90c662f31f06851

# ── Runtime environment variable ──────────────────────────────────────────────
# server.js reads DATA_DIR to locate Pipeline_*.json and Revenue_*.json.
# Setting it here means you can also override at `docker run` time:
#   docker run -e DATA_DIR=/app/data ...
ENV DATA_DIR=/app/data

# ── Dependencies (cached layer) ───────────────────────────────────────────────
COPY package*.json ./
RUN npm ci --omit=dev

# ── Application source ────────────────────────────────────────────────────────
COPY server.js ./
COPY public/ ./public/

# ── Data files ────────────────────────────────────────────────────────────────
# Copy the chosen dump folder into /app/data (the path DATA_DIR points to).
# Using COPY with a build arg requires the shell form of ARG expansion.
COPY ["${DATA_SRC}/", "/app/data/"]

EXPOSE 3000
CMD ["node", "server.js"]
