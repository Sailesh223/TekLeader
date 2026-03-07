# TekLeader - Lattice Utilization Leaderboard

A full-stack gamified leaderboard application for tracking and visualizing manager performance based on 1:1 meeting utilization metrics.

## Features

- **Automated Data Processing**: Upload Excel files and automatically calculate scores, rankings, and badges
- **Multi-dimensional Scoring**: Utilization, team size complexity, and consistency metrics
- **Gamification**: Classification bands (Gold/Silver/Bronze/Ignition Zone) and achievement badges
- **Interactive Dashboards**: User-friendly leaderboard view and comprehensive admin panel
- **Professional Tekion Teal UI**: Data-intensive, modern design with smooth animations

## Tech Stack

### Backend
- Spring Boot 3.2.0 (Java 17)
- PostgreSQL 15
- Apache POI for Excel processing
- Flyway for database migrations
- Swagger/OpenAPI documentation

### Frontend
- React 18 with TypeScript
- Material-UI (MUI) with Tekion teal theme
- Framer Motion for animations
- Zustand for state management
- Recharts for data visualization
- Axios for API calls

### Infrastructure
- Docker & Docker Compose
- PostgreSQL in Docker container

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- At least 4GB RAM available for Docker

### Running the Application

#### Option 1: Using the Start Script (Recommended)
```bash
./start.sh
```

#### Option 2: Using Docker Compose Directly

1. **Start all services with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

   This command will:
   - Start PostgreSQL database on port 5432
   - Build and start the Spring Boot backend on port 8080
   - Build and start the React frontend on port 3000

2. **Access the application:**
   - **Frontend (User Dashboard)**: http://localhost:3000
   - **Backend API**: http://localhost:8080
   - **Swagger UI**: http://localhost:8080/swagger-ui.html

3. **Stop the application:**
   ```bash
   docker-compose down
   ```

4. **Stop and remove all data (including database):**
   ```bash
   docker-compose down -v
   ```

#### First Time Setup
The application will automatically:
- Create the PostgreSQL database
- Run Flyway migrations to create tables
- Seed initial badge definitions and formula configurations
- Start the backend API server
- Start the frontend development server

**Note**: The first build may take 5-10 minutes as it downloads dependencies.

## Usage Guide

### Admin Workflow

1. **Navigate to Admin Dashboard**: Click "Admin" in the top navigation
2. **Upload Data**: 
   - Click "Upload Data" card
   - Select the month (YYYY-MM format)
   - Choose upload mode:
     - **Overwrite**: Replace existing data for the month
     - **Skip**: Only add new managers, skip existing ones
   - Select the Excel file (must have "People Manager Pivot Summary" tab)
   - Click "Upload and Process"
3. **View Results**: See processing summary with created/updated/failed records

### User Workflow

1. **View Leaderboard**: Navigate to "Leaderboard" (default page)
2. **Filter Data**:
   - Select month from dropdown
   - Filter by Functional Head (Kunal Bhattacharya, Teza Mukkavilli, or All)
   - Filter by Classification Band (Gold, Silver, Bronze, Ignition Zone, or All)
   - Search by manager name
3. **View Details**: Each card shows:
   - Rank with medals for top 3 (🥇🥈🥉)
   - Manager name and functional head
   - Classification band badge
   - Final score with progress bar
   - Utilization percentage
   - Earned badges (up to 3 displayed)

## Excel File Format

The Excel file must contain a sheet named **"People Manager Pivot Summary"** with the following columns:

| Column Name | Type | Description |
|------------|------|-------------|
| People Manager | Text | Manager's name |
| Functional Head | Text | Kunal Bhattacharya or Teza Mukkavilli |
| Headcount | Number | Team size |
| 1:1s Participated | Number | Number of 1:1 meetings |
| Total users not utilizing | Number | Users not using Lattice |
| Utilization % | Number/Percentage | Utilization rate (85%, 85, or 0.85) |

**Sample file**: `TekLeader/Tekion-Adoption-Jan2026.xlsx`

## Scoring System

### Final Score Calculation
```
FinalScore = (0.7 × Utilization) + (0.2 × TeamSizeScore) + (0.1 × ConsistencyScore)
```

### Team Size Score
- 1-3 members: 25 points
- 4-6 members: 50 points
- 7-10 members: 75 points
- 10+ members: 100 points

### Consistency Score
```
ConsistencyScore = 100 - (2 × |CurrentUtilization - PreviousUtilization|)
```
- First month: 50 points (neutral)
- Rewards stable performance

### Classification Bands
- **Gold**: 90-100 points
- **Silver**: 60-89 points
- **Bronze**: 30-59 points
- **Ignition Zone**: 0-29 points

## Badge System

### 1:1 Champion 🏆
- **Criteria**: 100% utilization in the previous month
- **Color**: Gold (#FFD700)

### Streak Star ⭐
- **Criteria**: 2+ consecutive months with >80% utilization
- **Color**: Red (#FF6B6B)

### Most Improved 📈
- **Criteria**: Highest month-on-month utilization improvement
- **Color**: Teal (#4ECDC4)
- **Note**: Only one manager per month

### Heavy Lifter 💪
- **Criteria**: Team size ≥7 AND utilization >80%
- **Color**: Mint (#95E1D3)

## API Endpoints

### Upload
- `POST /api/uploads/monthly?month=YYYY-MM&mode=overwrite|skip`
  - Upload Excel file with multipart/form-data

### Leaderboard
- `GET /api/leaderboard?month=YYYY-MM&functionalHead=all&band=all&search=&page=0&size=25`
  - Get leaderboard with filters

### Months
- `GET /api/months`
  - Get list of available months

## Development

### Backend Development
```bash
cd backend
./mvnw spring-boot:run
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Database Access
```bash
docker exec -it tekleader-postgres psql -U tekleader -d tekleader
```

## Troubleshooting

### Port Already in Use
If ports 3000, 5432, or 8080 are already in use:
```bash
# Find and kill the process using the port
lsof -ti:3000 | xargs kill -9
lsof -ti:5432 | xargs kill -9
lsof -ti:8080 | xargs kill -9
```

### Database Connection Issues
```bash
# Restart just the database
docker-compose restart postgres

# Check database logs
docker-compose logs postgres
```

### Frontend Not Loading
```bash
# Rebuild frontend container
docker-compose up --build frontend
```

## License

Proprietary - Tekion Corp

