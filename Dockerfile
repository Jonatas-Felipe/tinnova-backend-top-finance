FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

RUN yarn knex:migrate

RUN yarn build

COPY docker-entrypoint.sh .
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3335

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/src/main.js"]