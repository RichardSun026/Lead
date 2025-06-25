FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY backend ./backend
RUN npm install -g pnpm \
    && pnpm install --frozen-lockfile \
    && pnpm run build \
    && pnpm prune --prod
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
