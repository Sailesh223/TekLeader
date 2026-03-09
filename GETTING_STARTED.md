# 🚀 TekLeader - Getting Started Guide

## What is TekLeader?

TekLeader is a **gamified leaderboard application** that tracks and visualizes manager performance based on 1:1 meeting utilization in Lattice. It features:

- 📊 **Automated Scoring**: Multi-dimensional scoring based on utilization, team size, and consistency
- 🏆 **Gamification**: Classification bands (Gold/Silver/Bronze/Ignition Zone) and achievement badges
- 📈 **Professional UI**: Data-intensive Tekion teal-themed interface with smooth animations
- 🔄 **Excel Integration**: Upload monthly data directly from Excel files

---

## ⚡ Quick Start (3 Steps)

### Step 1: Start the Application
```bash
./start.sh
```
**OR**
```bash
docker-compose up --build
```

### Step 2: Wait for Services to Start
You'll see logs indicating:
- ✅ PostgreSQL is ready
- ✅ Backend started on port 8080
- ✅ Frontend started on port 3000

**First-time setup takes 5-10 minutes** (downloading dependencies)

### Step 3: Access the Application
Open your browser and go to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **Swagger Docs**: http://localhost:8080/swagger-ui.html

---

## 📤 Uploading Your First Data

### 1. Navigate to Admin Dashboard
- Click **"Admin"** in the top navigation bar
- Click **"Upload Data"** card

### 2. Prepare Your Excel File
Your Excel file must have a sheet named **"People Manager Pivot Summary"** with these columns:

| Column | Example |
|--------|---------|
| People Manager | John Doe |
| Functional Head | Kunal Bhattacharya |
| Headcount | 8 |
| 1:1s Participated | 7 |
| Total users not utilizing | 1 |
| Utilization % | 87.5% |

**Sample file**: `TekLeader/Tekion-Adoption-Jan2026.xlsx`

### 3. Upload Process
1. Select the month (e.g., `2026-01`)
2. Choose upload mode:
   - **Overwrite**: Replace all data for this month
   - **Skip**: Only add new managers
3. Click the upload area and select your Excel file
4. Click **"Upload and Process"**

### 4. View Results
- See processing summary (created/updated/failed records)
- Check for any errors in the error table
- Navigate to **"Leaderboard"** to see the results

---

## 🎯 Using the Leaderboard

### Filters Available
- **Month**: Select which month to view
- **Functional Head**: Filter by Kunal Bhattacharya, Teza Mukkavilli, or All
- **Classification Band**: Filter by Gold, Silver, Bronze, Ignition Zone, or All
- **Search**: Type manager name to search

### What You'll See
Each manager card displays:
- 🥇 **Rank**: Position with medals for top 3
- 📊 **Final Score**: Calculated score with progress bar
- 📈 **Utilization**: Percentage of team using Lattice
- 🏅 **Badges**: Achievement badges earned
- 📋 **Details**: Team size, functional head, classification band

---

## 🏆 Understanding the Scoring System

### Final Score Formula
```
Final Score = (0.7 × Utilization) + (0.2 × Team Size Score) + (0.1 × Consistency Score)
```

### Team Size Score
- **1-3 members**: 25 points
- **4-6 members**: 50 points
- **7-10 members**: 75 points
- **10+ members**: 100 points

### Consistency Score
```
Consistency = 100 - (2 × |Current Utilization - Previous Utilization|)
```
- First month: 50 points (neutral)
- Rewards stable performance

### Classification Bands
- 🥇 **Gold**: 90-100 points
- 🥈 **Silver**: 60-89 points
- 🥉 **Bronze**: 30-59 points
- 🔥 **Ignition Zone**: 0-29 points

---

## 🎖️ Badge System

### 1:1 Champion 🏆
- **Criteria**: 100% utilization in previous month
- **Color**: Gold

### Streak Star ⭐
- **Criteria**: 2+ consecutive months with >80% utilization
- **Color**: Red

### Most Improved 📈
- **Criteria**: Highest month-on-month improvement
- **Color**: Teal
- **Note**: Only one manager per month

### Heavy Lifter 💪
- **Criteria**: Team size ≥7 AND utilization >80%
- **Color**: Mint

---

## 🛠️ Common Commands

### Start Application
```bash
./start.sh
```

### Stop Application
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f
```

### Reset Everything (Fresh Start)
```bash
docker-compose down -v
./start.sh
```

### Access Database
```bash
docker exec -it tekleader-postgres psql -U tekleader -d tekleader
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000, 8080, or 5432
lsof -ti:3000 | xargs kill -9
lsof -ti:8080 | xargs kill -9
lsof -ti:5432 | xargs kill -9
```

### Services Not Starting
```bash
# Check Docker is running
docker info

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

### Database Connection Issues
```bash
# Restart database
docker-compose restart postgres

# Check database health
docker exec tekleader-postgres pg_isready -U tekleader
```

### Frontend Not Loading
```bash
# Rebuild frontend
docker-compose up --build frontend
```

---

## 📚 Additional Resources

- **Full Documentation**: See `README.md`
- **Command Reference**: See `COMMANDS.md`
- **PRD**: See `TekLeader/PRD.md`
- **Sample Data**: See `TekLeader/Tekion-Adoption-Jan2026.xlsx`

---

## 🎨 UI Features

- **Tekion Teal Theme**: Professional #00BFA5 primary color
- **Smooth Animations**: Framer Motion for card transitions
- **Responsive Design**: Works on desktop and tablet
- **Data Visualization**: Progress bars, charts, and statistics
- **Real-time Search**: Instant filtering as you type

---

## 🔐 Default Credentials

- **Database User**: tekleader
- **Database Password**: tekleader123
- **Database Name**: tekleader
- **Database Port**: 5432

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review logs: `docker-compose logs -f`
3. Consult `COMMANDS.md` for detailed command reference

---

**Happy Leaderboarding! 🚀**

