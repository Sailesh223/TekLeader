# TekLeader - Quick Command Reference

## 🚀 Starting the Application

### Quick Start (Recommended)
```bash
./start.sh
```

### Manual Start
```bash
docker-compose up --build
```

### Start in Background (Detached Mode)
```bash
docker-compose up -d --build
```

## 🛑 Stopping the Application

### Stop All Services
```bash
docker-compose down
```

### Stop and Remove All Data (Fresh Start)
```bash
docker-compose down -v
```

### Stop Specific Service
```bash
docker-compose stop backend
docker-compose stop frontend
docker-compose stop postgres
```

## 📊 Viewing Logs

### View All Logs
```bash
docker-compose logs -f
```

### View Specific Service Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### View Last 100 Lines
```bash
docker-compose logs --tail=100 backend
```

## 🔄 Rebuilding Services

### Rebuild All Services
```bash
docker-compose up --build
```

### Rebuild Specific Service
```bash
docker-compose up --build backend
docker-compose up --build frontend
```

### Force Rebuild (No Cache)
```bash
docker-compose build --no-cache
docker-compose up
```

## 🗄️ Database Commands

### Access PostgreSQL CLI
```bash
docker exec -it tekleader-postgres psql -U tekleader -d tekleader
```

### Common SQL Commands (once in psql)
```sql
-- List all tables
\dt

-- View managers
SELECT * FROM managers;

-- View monthly metrics
SELECT * FROM monthly_metrics ORDER BY month DESC, rank ASC LIMIT 10;

-- View badge awards
SELECT * FROM badge_awards;

-- Exit psql
\q
```

### Backup Database
```bash
docker exec tekleader-postgres pg_dump -U tekleader tekleader > backup.sql
```

### Restore Database
```bash
docker exec -i tekleader-postgres psql -U tekleader tekleader < backup.sql
```

## 🔍 Debugging

### Check Container Status
```bash
docker-compose ps
```

### Inspect Container
```bash
docker inspect tekleader-backend
docker inspect tekleader-frontend
docker inspect tekleader-postgres
```

### Execute Command in Container
```bash
docker exec -it tekleader-backend sh
docker exec -it tekleader-frontend sh
```

### Check Network
```bash
docker network ls
docker network inspect lebo_tekleader-network
```

## 🧹 Cleanup

### Remove All Stopped Containers
```bash
docker container prune
```

### Remove All Unused Images
```bash
docker image prune -a
```

### Remove All Unused Volumes
```bash
docker volume prune
```

### Complete Cleanup (Nuclear Option)
```bash
docker-compose down -v
docker system prune -a --volumes
```

## 📦 Development Commands

### Backend Only (Local Development)
```bash
cd backend
./mvnw spring-boot:run
```

### Frontend Only (Local Development)
```bash
cd frontend
npm install
npm run dev
```

### Run Tests
```bash
# Backend tests
cd backend
./mvnw test

# Frontend tests (if configured)
cd frontend
npm test
```

## 🌐 Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **Database**: localhost:5432 (user: tekleader, password: tekleader123)

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -ti:3000
lsof -ti:8080
lsof -ti:5432

# Kill process
lsof -ti:3000 | xargs kill -9
```

### Reset Everything
```bash
docker-compose down -v
docker system prune -a --volumes
./start.sh
```

### Check Docker Resources
```bash
docker stats
```

### View Docker Disk Usage
```bash
docker system df
```

