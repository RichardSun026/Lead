FROM node:20-alpine AS builder
WORKDIR /app/onboarding
COPY frontend/RealtorInterface/Onboarding ./
# bring in backend environment variables so Vite can read them
COPY backend/.env ./.env
RUN npm install
RUN npm run build

FROM nginx:alpine
COPY frontend/RealtorInterface/Onboarding/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/onboarding/dist /usr/share/nginx/html/onboarding
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
