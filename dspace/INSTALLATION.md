# Harare Polytechnic Digital Repository — DSpace 7.6.2

**Server:** hrepolyREP | **IP:** 192.168.26.3

## Live URLs

| Service | URL |
|---------|-----|
| Public Portal | http://192.168.26.3:4000 |
| Admin Panel | http://192.168.26.3:4000/dspace-admin |
| REST API | http://192.168.26.3:8080/server |
| Solr Admin | http://192.168.26.3:8983/solr |

## Admin Credentials

- **Email:** admin@hararepolytechnic.ac.zw
- **Password:** HarePoly@DSpace2024! *(change after first login)*

## Architecture

```
                  ┌─────────────────────┐
 Browser ──4000──▶│  dspace-angular     │ Angular SSR Frontend
                  │  (Node.js / SSR)    │
                  └─────────┬───────────┘
                            │ REST proxy
                  ┌─────────▼───────────┐
          8080 ──▶│  Tomcat 9 + DSpace  │ Spring Boot Backend
                  │  server-7.6.2.war   │
                  └───┬──────────┬──────┘
                      │          │
           ┌──────────▼──┐  ┌───▼──────┐
           │  PostgreSQL  │  │  Solr    │
           │  16 / dspace │  │  8.11.3  │
           │  :5432       │  │  :8983   │
           └─────────────┘  └──────────┘
```

## Starting / Stopping Services

```bash
# Start Solr
/opt/solr-8.11.3/bin/solr start -p 8983 -force

# Start DSpace backend (Tomcat 9)
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 /opt/tomcat9/bin/startup.sh

# Start Angular frontend
cd /home/user/dspace-angular && node dist/server/main.js &>/var/log/dspace-angular.log &

# Stop everything
/opt/tomcat9/bin/shutdown.sh
/opt/solr-8.11.3/bin/solr stop
pkill -f "node dist/server/main.js"
```

## Database

```bash
# Connect to DSpace database
psql -U dspace -d dspace

# Re-run migrations (if needed)
/dspace/bin/dspace database migrate

# Re-index Solr
/dspace/bin/dspace index-discovery -b
```

## File Locations

| Item | Path |
|------|------|
| DSpace home | `/dspace` |
| DSpace config | `/dspace/config/local.cfg` |
| DSpace logs | `/dspace/log/` |
| Uploaded files | `/dspace/assetstore/` |
| Tomcat 9 | `/opt/tomcat9/` |
| Tomcat logs | `/opt/tomcat9/logs/catalina.out` |
| Solr | `/opt/solr-8.11.3/` |
| Angular source | `/home/user/dspace-angular/` |
| Angular built | `/home/user/dspace-angular/dist/` |
| Angular config | `/home/user/dspace-angular/config/config.yml` |
| Angular log | `/var/log/dspace-angular.log` |

## First Steps After Login

1. Log in at http://192.168.26.3:4000/login
2. Go to **Admin Panel** → **Edit Site Settings** — update the site description
3. Create top-level **Communities** (e.g., Faculty of Engineering, Faculty of Business)
4. Create **Collections** within each community (e.g., Student Theses, Journal Articles)
5. Start submitting items or bulk import via CSV/SAF

## Building for Deployment on hrepolyREP Server

Run `dspace/scripts/install-on-server.sh` as root on the physical server.
The script handles all dependencies, build, database setup, and Solr configuration.
