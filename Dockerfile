FROM node:20

RUN npm install -g pnpm

WORKDIR /app

COPY . .

RUN pnpm install --no-frozen-lockfile --ignore-scripts

RUN pnpm --filter api-server build

RUN pnpm --filter quiz-app build

EXPOSE 8080

CMD ["node", "artifacts/api-server/dist/index.mjs"]
