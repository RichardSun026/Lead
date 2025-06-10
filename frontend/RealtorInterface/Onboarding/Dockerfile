FROM node:20-alpine AS build
WORKDIR /app/onboarding
COPY frontend/RealtorInterface/Onboarding ./
RUN npm install && npm run build

FROM nginx:alpine
COPY frontend/RealtorInterface/Onboarding/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/onboarding/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
