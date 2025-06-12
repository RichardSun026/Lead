# Nginx Reverse Proxy Setup

This guide explains how to run an Nginx container that forwards traffic to all application services.

## Overview

The `docker-compose.yml` file defines a `proxy` service using the official `nginx:alpine` image. The container listens on ports 80 and 443, terminates TLS and proxies requests to the API and the front ends running on internal ports.

```yaml
proxy:
  image: nginx:alpine
  container_name: lead-proxy
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./proxy/conf.d:/etc/nginx/conf.d:ro
    - /etc/letsencrypt/live/myrealvaluation.com:/etc/nginx/certs:ro
  depends_on:
    - site
    - survey
    - onboarding
    - leadreports
    - api
```

The virtual host files live in `proxy/conf.d`. A sample configuration forwards different URL paths to each service.

```nginx
# HTTP → HTTPS redirect
server {
    listen 80;
    server_name myrealvaluation.com;
    return 301 https://$host$request_uri;
}

# TLS termination + reverse-proxy
server {
    listen 443 ssl;
    server_name myrealvaluation.com;

    ssl_certificate     /etc/letsencrypt/live/myrealvaluation.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/myrealvaluation.com/privkey.pem;

    location /          { proxy_pass http://site:80;        proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; }
    location /survey/   { proxy_pass http://survey:80/;     proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; }
    location /onboarding/ { proxy_pass http://onboarding:80/; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; }
    location /reports/  { proxy_pass http://leadreports:80/; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; }
    location /api/      { proxy_pass http://api:3000/;      proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; }
}
```

The certificate paths above assume you have obtained TLS certificates (for example using Let's Encrypt) and mounted them into the container. Adjust the domain name and certificate locations to match your environment.

## Running

Start all services with Docker Compose:

```bash
docker-compose up --build
```

Once the containers are running, Nginx exposes ports 80 and 443 on the host. It routes requests to:

- `/` → landing page container (`site`)
- `/survey/` → survey container (`survey`)
- `/onboarding/` → onboarding front end
- `/reports/` → lead reports front end
- `/api/` → NestJS backend

With this setup a single domain serves the entire application stack over HTTPS.
