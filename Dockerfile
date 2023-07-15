FROM node:17-alpine as build-image
WORKDIR /usr/src
COPY package*.json ./
COPY tsconfig.json ./
COPY ./src ./src
RUN npm ci
RUN npx tsc

FROM node:17-alpine
WORKDIR /usr/src
COPY package*.json ./
COPY --from=build-image ./usr/src/dist ./dist
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD [ "node", "dist/index.js" ]