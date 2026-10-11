# ╭────────────────────────────────────────────
# │  ATLAS BOT · Dockerfile (compatible con Render)
# ╰────────────────────────────────────────────
FROM node:20-alpine

RUN apk add --no-cache git ffmpeg libwebp-tools tzdata

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY . .

ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000

CMD ["npm", "start"]
