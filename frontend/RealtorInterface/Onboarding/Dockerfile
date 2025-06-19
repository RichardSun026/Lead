FROM node:20-alpine AS builder
WORKDIR /app/onboarding
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
COPY frontend/RealtorInterface/Onboarding ./
RUN npm install
RUN npm run build

FROM nginx:alpine
COPY frontend/RealtorInterface/Onboarding/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/onboarding/dist /usr/share/nginx/html/onboarding
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
