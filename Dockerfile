FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
# Quitamos --frozen-lockfile para asegurar que se instalen todos los módulos necesarios
RUN yarn install
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
