# RepoMind Spring Boot Backend

## Stack
Java 21, Spring Boot 3.4.2, Spring Web, Validation, Spring Data JPA, MySQL 8.4.

## Prerequisites
- JDK 21
- Maven 3.9+ (or import the Maven project in IntelliJ IDEA)
- Docker Desktop for the included MySQL container, or a local MySQL server
- Python FastAPI service for actual analysis results

## Start MySQL
From this folder:
```bash
docker compose up -d mysql
```
Default local database: `repomind`; username: `root`; password: `root`.
Change these defaults before sharing or deploying the application.

Without Docker, create a database named `repomind` and set `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`.

## Run backend
```bash
mvn spring-boot:run
```
Or open the folder in IntelliJ IDEA and run `com.repomind.RepoMindApplication`.

The API starts at `http://localhost:8080`.

## Verify
Open `http://localhost:8080/api/health`. Expected:
```json
{"status":"UP","service":"repomind-backend"}
```

## Python service
Default URL: `http://localhost:8001`. Override with `PYTHON_SERVICE_URL`.
Implement the three Python endpoints described in `docs/API_CONTRACT.md`.

## React connection
Set the React project's `.env`:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```
Restart Vite after changing `.env`.

## Responsibilities and limitations
Java validates requests, orchestrates Python calls, and stores report JSON and summary scores in MySQL. Python performs static analysis, ML matching, and repository learning.
This starter does not yet implement user authentication, GitHub OAuth, private-repository authorization, or repository cloning. Use authorized read-only access. Never execute untrusted repository code directly on the application server. Add user ownership, database migrations, audit logging, and production secrets management before deployment.
