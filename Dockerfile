FROM node:20-bullseye

RUN npm install -g pnpm

WORKDIR /app

COPY . .

RUN pnpm install --no-frozen-lockfile

RUN pnpm --filter api-server build

RUN pnpm --filter quiz-app build

RUN find /app/artifacts/quiz-app -type d 2>/dev/null

EXPOSE 8080

CMD ["node", "artifacts/api-server/dist/index.mjs"]
