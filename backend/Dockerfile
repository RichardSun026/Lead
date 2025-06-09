FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY backend ./backend
RUN npm install && npm run build && npm prune --omit=dev
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
