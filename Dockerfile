FROM openjdk:17-jdk-slim

ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar
COPY uploads /app/uploads

EXPOSE 8080

ENTRYPOINT ["java","-jar","/app.jar"]
