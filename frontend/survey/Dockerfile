FROM node:20-alpine AS build
WORKDIR /app/survey
COPY frontend/survey ./
RUN npm install && npm run build

FROM nginx:alpine
COPY frontend/survey/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/survey/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
