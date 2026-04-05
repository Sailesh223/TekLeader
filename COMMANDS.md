# Run Instructions

# Jithu

## Check if Backend is Running
lsof -i :8080

## Kill Backend (if running)
lsof -ti :8080 | xargs kill -9

## Backend Run
cd backend && export JAVA_HOME=$(/usr/libexec/java_home -v 17) && mvn spring-boot:run

## Frontend Run
cd frontend && yarn dev

# Sailesh

## Backend Run
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@17/17.0.18/libexec/openjdk.jdk/Contents/Home && mvn clean spring-boot:run

## Frontend Run
npm run dev

## Kafka Run
brew services start kafka
## Check Kafka Status
brew services info kafka
## Stop Kafka
brew services stop kafka

## Mongo
mkdir -p ~/data/db && mongod --dbpath ~/data/db