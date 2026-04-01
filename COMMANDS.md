# Run Instructions

# Jithu
## Backends Run
cd backend && export JAVA_HOME=$(/usr/libexec/java_home -v 17) && mvn spring-boot:run
## Frontend Run
cd frontend && yarn dev

# Sailesh
## Backends Run
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@17/17.0.18/libexec/openjdk.jdk/Contents/Home && mvn clean spring-boot:run
## Frontend Run
npm run dev
## Kafka Run
brew services start kafka
## mongo
mkdir -p ~/data/db && mongod --dbpath ~/data/db