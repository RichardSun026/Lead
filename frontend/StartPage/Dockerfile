FROM node:20-alpine AS build
WORKDIR /app/startpage
COPY frontend/StartPage ./
RUN npm install && npm run build

FROM nginx:alpine
COPY frontend/StartPage/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/startpage/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
