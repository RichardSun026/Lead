FROM node:20-alpine AS build
WORKDIR /app/reports
COPY frontend/RealtorInterface/LeadReports ./
RUN npm install && npm run build

FROM nginx:alpine
COPY frontend/RealtorInterface/LeadReports/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/reports/dist /usr/share/nginx/html/LeadReports
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
