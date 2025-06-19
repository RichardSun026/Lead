FROM node:20-alpine AS build
WORKDIR /app/console
COPY frontend/RealtorInterface/Console ./
RUN npm install && npm run build

FROM nginx:alpine
COPY frontend/RealtorInterface/Console/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/console/dist /usr/share/nginx/html/console
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
