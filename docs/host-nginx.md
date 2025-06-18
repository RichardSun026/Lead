# Host-level Nginx Front Door

We no longer run an Nginx **proxy container**. Instead, Ubuntu’s native Nginx
owns ports **80/443** and forwards requests to Docker-mapped ports:

| Path | Target container | Port |
|------|------------------|------|
| `/` | `startpage` | `4173` |
| `/survey` | `survey` | `4174` |
| `/onboarding` | `onboarding` | `4175` |
| `/console/reports` | `leadreports` | `4176` |
| `/api/` | `api` | `3000` |

## Deployment steps

1. `docker compose up -d --build` – starts all app containers.  
2. Copy `deploy/host-nginx/myrealvaluation.conf` into
   `/etc/nginx/sites-available/` and symlink to `sites-enabled/`.  
3. `sudo nginx -t && sudo systemctl reload nginx`.

## Troubleshooting

* **Ports 80/443 already in use** – make sure only Ubuntu’s Nginx is listening;
  stop any leftover proxy containers.  
* **SPA deep links 404** – ensure each SPA’s internal Nginx still contains
  `try_files $uri /index.html;`.  
* **API 502 errors** – verify `api` container is running and port `3000` is
  published.
