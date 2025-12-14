FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install

COPY . .

RUN npx prisma generate
RUN pnpm build

EXPOSE 4000

CMD ["pnpm", "start"]
