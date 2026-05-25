FROM node:20-alpine AS builder
WORKDIR /app
# Primero solo copiamos archivos de dependencias para aprovechar la caché de Docker
COPY package.json yarn.lock ./
RUN yarn install
# Recién ahora copiamos el código y compilamos
COPY . .
RUN yarn build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json yarn.lock ./
RUN yarn install --production --ignore-engines
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["yarn", "start:prod"]
