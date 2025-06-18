FROM node:20-alpine AS builder
WORKDIR /app/onboarding
COPY frontend/RealtorInterface/Onboarding ./
RUN npm install
RUN npm run build

FROM nginx:alpine
COPY frontend/RealtorInterface/Onboarding/nginx.conf /etc/nginx/conf.d/default.conf
RUN mkdir -p /usr/share/nginx/html/onboarding
COPY --from=builder /app/onboarding/dist /usr/share/nginx/html/onboarding
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
