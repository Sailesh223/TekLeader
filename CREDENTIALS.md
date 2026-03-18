# 🔐 TekLeader - Credentials & Configuration

## 📋 Application URLs

### Local Development (Without Docker)
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend API**: http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **API Docs**: http://localhost:8080/api-docs

### Docker Deployment
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8081/api
- **Swagger UI**: http://localhost:8081/swagger-ui.html
- **MongoDB**: localhost:27017

---

## 🗄️ Database Credentials

### MongoDB (Local - No Auth)
```yaml
Host: localhost
Port: 27017
Database: tekleader
URI: mongodb://localhost:27017/tekleader
Authentication: None (local development)
```

### MongoDB (Docker - With Auth)
```yaml
Host: localhost (from host machine) / mongodb (from containers)
Port: 27017
Database: tekleader
Username: tekleader
Password: tekleader123
Auth Source: admin
URI: mongodb://tekleader:tekleader123@localhost:27017/tekleader?authSource=admin
```

---

## 👤 Admin Login Credentials

### Admin Access
```yaml
Email: jithu@gmail.com
Password: Jithu564@
Role: Admin
Access: Full access to admin dashboard, data upload, formula config, badge management
```

### User Login
```yaml
Type: Name-based (no password)
Access: View leaderboards, personal dashboard
Note: Enter any name to login as a regular user
```

### Director Login
```yaml
Type: Selection-based (no password)
Access: View team hierarchy and performance
Note: Select from available directors list
```

### Functional Head Login
```yaml
Type: Selection-based (no password)
Access: View organization hierarchy
Note: Select from available functional heads list
```

---

## 🚀 Backend Configuration

### Application Properties
```yaml
Server Port: 8080 (local) / 8081 (docker)
Spring Profile: default
Max File Upload Size: 10MB
Max Request Size: 10MB
```

### Environment Variables
```bash
# MongoDB Connection (Docker)
SPRING_DATA_MONGODB_URI=mongodb://tekleader:tekleader123@mongodb:27017/tekleader?authSource=admin
SPRING_DATA_MONGODB_DATABASE=tekleader

# MongoDB Connection (Local)
SPRING_DATA_MONGODB_URI=mongodb://localhost:27017/tekleader
SPRING_DATA_MONGODB_DATABASE=tekleader
```

---

## 🎨 Frontend Configuration

### Environment Variables
```bash
# API Base URL (Docker)
VITE_API_BASE_URL=http://localhost:8081/api

# API Base URL (Local)
VITE_API_BASE_URL=http://localhost:8080/api
```

### Default Configuration
- **Dev Server Port**: 5173 (Vite default)
- **Docker Port**: 3001 (mapped from 3000)
- **API Fallback**: http://localhost:8080/api

---

## 🐳 Docker Services

### Service Ports
```yaml
MongoDB:
  Container Port: 27017
  Host Port: 27017
  
Backend:
  Container Port: 8080
  Host Port: 8081
  
Frontend:
  Container Port: 3000
  Host Port: 3001
```

### Volume Mounts
```yaml
mongodb_data: /data/db
maven_cache: /root/.m2
```

---

## 🔧 Java Configuration

### Required Java Version
```bash
Java Version: 17
JAVA_HOME: /opt/homebrew/Cellar/openjdk@17/17.0.18/libexec/openjdk.jdk/Contents/Home
```

### Maven
```bash
Maven Version: 3.9.12+
```

---

## 📝 Run Commands

### Backend (Local)
```bash
cd backend
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@17/17.0.18/libexec/openjdk.jdk/Contents/Home
mvn clean spring-boot:run
```

### Frontend (Local)
```bash
cd frontend
yarn dev
# or
npm run dev
```

### Docker (All Services)
```bash
docker-compose up --build
# or
./start.sh
```

---

## 🛑 Stop Services

### Kill Port Processes
```bash
# Backend
lsof -ti:8080 | xargs kill -9

# Frontend
lsof -ti:5173 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# MongoDB
lsof -ti:27017 | xargs kill -9
```

### Docker
```bash
docker-compose down
# With volumes
docker-compose down -v
```

---

## 🎯 Avatar System

### DiceBear API (Free, No Auth)
```
Base URL: https://api.dicebear.com/7.x/
Styles: avataaars, bottts, personas, initials
Example: https://api.dicebear.com/7.x/avataaars/svg?seed=user@email.com
```

### Local Storage
```javascript
Key Format: avatar_${userEmail}
Value: { url: string, options: AvatarOptions }
```

---

## 📊 Default Data

### Sample Excel File
```
Location: ./Tekion-Adoption-Jan2026.xlsx
Sheet Name: People Manager Pivot Summary
```

### Required Columns
- People Manager
- Functional Head
- Headcount
- 1:1s Participated
- Total users not utilizing
- Utilization %

---

## 🔍 Monitoring & Debugging

### Logs
```bash
# Docker logs
docker-compose logs -f
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Backend logs (local)
# Check console output
```

### Health Checks
```bash
# Backend health
curl http://localhost:8080/api/health

# MongoDB health (Docker)
docker exec tekleader-mongodb mongosh --eval "db.adminCommand('ping')"
```

---

**Last Updated**: 2026-03-18

