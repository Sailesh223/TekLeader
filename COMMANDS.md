# Backends Run
cd backend && export JAVA_HOME=$(/usr/libexec/java_home -v 17) && mvn spring-boot:run

# Frontend Run
cd frontend && yarn dev