FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 4200
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0"]
