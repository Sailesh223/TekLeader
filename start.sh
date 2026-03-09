#!/bin/bash

echo "🚀 Starting TekLeader Application..."
echo ""
echo "This will start:"
echo "  - PostgreSQL Database (port 5432)"
echo "  - Spring Boot Backend (port 8080)"
echo "  - React Frontend (port 3000)"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Stop any existing containers
echo "🧹 Cleaning up existing containers..."
docker-compose down

# Build and start all services
echo ""
echo "🏗️  Building and starting services..."
docker-compose up --build

# Note: The script will keep running and show logs
# Press Ctrl+C to stop all services

