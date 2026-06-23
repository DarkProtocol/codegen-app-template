FROM node:24-alpine AS build

WORKDIR /app

COPY package.json ./

RUN npm install --force

COPY . .

ARG APP_NAME
ENV APP_NAME=${APP_NAME}

ARG APP_LOCALE
ENV APP_LOCALE=${APP_LOCALE}

ARG API_URL
ENV API_URL=${API_URL}

RUN npm run lint
RUN npm run build

FROM node:24-alpine AS dist

WORKDIR /app

COPY --from=build /app/ ./

EXPOSE 3000
CMD ["npm", "run", "start"]
