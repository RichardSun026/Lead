FROM node:20-alpine AS build
WORKDIR /app/site
COPY frontend/site ./
RUN npm install && npm run build

FROM nginx:alpine
COPY frontend/site/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/site/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
