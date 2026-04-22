FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json yarn.lock ./
# Instalamos todas las dependencias porque start:prod usa ts-node para las migraciones
RUN yarn install --frozen-lockfile
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["yarn", "start:prod"]
