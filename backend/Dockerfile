FROM node:20-alpine AS builder

# Install yt-dlp + ffmpeg + python
RUN apk add --no-cache python3 py3-pip ffmpeg curl && \
    pip3 install --break-system-packages yt-dlp

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ─────────────────────────────────────────────────────────
FROM node:20-alpine AS production

RUN apk add --no-cache python3 py3-pip ffmpeg && \
    pip3 install --break-system-packages yt-dlp

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

RUN mkdir -p data downloads

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
