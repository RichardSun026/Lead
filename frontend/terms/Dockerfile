FROM nginx:alpine
COPY frontend/terms/nginx.conf /etc/nginx/conf.d/default.conf
COPY frontend/terms/index.html /usr/share/nginx/html/terms/index.html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
