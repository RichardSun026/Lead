FROM node:20-alpine AS build
WORKDIR /app/console
COPY frontend/RealtorInterface/Console ./

# Inject Supabase credentials at build time so Vite can replace them in the
# bundled assets. The values are provided via build arguments which are
# populated by Docker Compose from `backend/.env`.
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

RUN npm install && npm run build

FROM nginx:alpine
COPY frontend/RealtorInterface/Console/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/console/dist /usr/share/nginx/html/console
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
