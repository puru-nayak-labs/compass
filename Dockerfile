FROM node:20-alpine
WORKDIR /app

# ── Build argument ─────────────────────────────────────────────────────────────
# DATA_SRC: path (relative to build context) of the pre-processed data folder
# to bake into the image. Override with:
#   docker build --build-arg DATA_SRC=<your/path> -t compass-app .
ARG DATA_SRC=data

# ── Runtime environment variable ───────────────────────────────────────────────
# server.js reads DATA_DIR to locate Pipeline.json and Revenue.json.
# Override at runtime:
#   docker run -e DATA_DIR=/custom/data ...
ENV DATA_DIR=/app/data

# ── Dependencies (cached layer) ────────────────────────────────────────────────
COPY package.json ./
RUN npm install --omit=dev

# ── Application source ─────────────────────────────────────────────────────────
COPY server.js ./
COPY public/ ./public/

# ── Data files ─────────────────────────────────────────────────────────────────
# Copy the chosen data folder into /app/data inside the container.
COPY ["${DATA_SRC}/", "/app/data/"]

EXPOSE 3000
CMD ["node", "server.js"]
