FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY backend ./backend
RUN npm install --omit=dev && npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
