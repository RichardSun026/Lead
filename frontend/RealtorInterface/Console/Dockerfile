FROM node:20-alpine AS build
WORKDIR /app/console
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
COPY frontend/RealtorInterface/Console ./
RUN npm install && npm run build

FROM nginx:alpine
COPY frontend/RealtorInterface/Console/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/console/dist /usr/share/nginx/html/console
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
