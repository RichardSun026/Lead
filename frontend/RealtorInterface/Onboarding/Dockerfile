FROM node:20-alpine AS builder
WORKDIR /app/onboarding
COPY frontend/RealtorInterface/Onboarding ./

# Supabase credentials are required during the build so the environment
# variables are inlined in the generated JavaScript.
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

RUN npm install
RUN npm run build

FROM nginx:alpine
COPY frontend/RealtorInterface/Onboarding/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/onboarding/dist /usr/share/nginx/html/onboarding
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
