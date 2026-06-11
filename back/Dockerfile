# 1. OpenJDK 17 사용
FROM openjdk:17-jdk-slim

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. JAR 파일 복사 (Gradle 빌드된 JAR 파일을 컨테이너로 복사)
COPY build/libs/login-0.0.1-SNAPSHOT.jar app.jar

# 4. 환경 변수 설정을 삭제 (Docker Compose에서 `.env`로 관리하므로 불필요)
# 🔥 ARG 설정을 제거함
# 🔥 ENV 설정을 제거함

# 5. 컨테이너 실행 시 Spring Boot 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
