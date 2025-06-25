FROM nginx:alpine
COPY frontend/sms-terms/nginx.conf /etc/nginx/conf.d/default.conf
COPY frontend/sms-terms/index.html /usr/share/nginx/html/sms-terms/index.html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
