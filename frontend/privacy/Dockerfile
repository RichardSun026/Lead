FROM nginx:alpine
COPY frontend/privacy/nginx.conf /etc/nginx/conf.d/default.conf
COPY frontend/privacy/index.html /usr/share/nginx/html/privacy/index.html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
