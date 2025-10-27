FROM openjdk:21-jdk-slim

# Copy your Spring Boot jar
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar

# Copy uploads folder if needed
COPY uploads /app/uploads

EXPOSE 8080

ENTRYPOINT ["java","-jar","/app.jar"]
