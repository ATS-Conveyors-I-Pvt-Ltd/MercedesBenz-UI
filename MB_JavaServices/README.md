# Mercedes-Benz Digital Assembly Platform - Java Backend Services

**Backend Services for Production Tracking, Andon System, and Takt Time Calculations**

## 📋 Overview

This is a **Spring Boot 3.2** Java backend service that provides REST APIs for the Mercedes-Benz Digital Assembly Platform. It's designed to replace/complement the Node.js Express backend and is based on the iprod 2 reference architecture.

### Technology Stack

- **Java**: 17
- **Spring Boot**: 3.2.2
- **Database**: Microsoft SQL Server
- **ORM**: Spring Data JPA / Hibernate
- **Build Tool**: Maven
- **Additional Libraries**: Lombok, MapStruct

---

## 🏗️ Project Structure

```
MB_JavaServices/
├── pom.xml                                 # Maven configuration
├── src/
│   ├── main/
│   │   ├── java/com/ats/mercedesbenz/
│   │   │   ├── MercedesBenzApplication.java    # Main application class
│   │   │   ├── config/
│   │   │   │   └── CorsConfig.java             # CORS configuration
│   │   │   ├── controller/
│   │   │   │   └── AndonController.java        # REST API endpoints
│   │   │   ├── dto/
│   │   │   │   ├── JsonResponseDto.java        # Standard response wrapper
│   │   │   │   └── AndonSummaryQueueDto.java   # Andon data DTO
│   │   │   ├── entity/
│   │   │   │   └── AndonSummaryQueue.java      # JPA entity
│   │   │   ├── repository/
│   │   │   │   └── AndonSummaryQueueRepository.java  # Data access layer
│   │   │   ├── service/
│   │   │   │   └── AndonService.java           # Business logic
│   │   │   ├── exception/
│   │   │   │   └── ResourceNotFoundException.java
│   │   │   └── util/
│   │   │       └── TaktTimeCalculator.java     # Calculation utilities
│   │   └── resources/
│   │       └── application.properties          # Configuration
│   └── test/
│       └── java/                               # Unit tests
└── README.md                                   # This file
```

---

## 🚀 Getting Started

### Prerequisites

1. **Java 17** or higher
2. **Maven 3.6+**
3. **MS SQL Server** (Docker container or local installation)
4. **IDE** (IntelliJ IDEA, Eclipse, or VS Code with Java extensions)

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd MB_JavaServices
   ```

2. **Build the project:**
   ```bash
   mvn clean install
   ```

3. **Run the application:**
   ```bash
   mvn spring-boot:run
   ```

   Or run the JAR file:
   ```bash
   java -jar target/mercedes-benz-services-1.0.0.jar
   ```

4. **Application will start on:** `http://localhost:8080/api`

---

## 🔌 API Endpoints

All endpoints return a standard JSON response format matching iprod pattern:

```json
{
  "status": 1,          // 1=Success, 0=Error, 2=Unauthorized
  "successMsg": "...",  // Success message (optional)
  "errorMsg": "...",    // Error message (optional)
  "data": {}            // Response data
}
```

### Andon Service Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/andon/current-shift` | Get current shift details for all lines |
| GET | `/api/andon/day-wise?lineId={id}&date={date}` | Get day-wise data for specific line |
| POST | `/api/andon/update-actuals` | Update shift actuals |
| GET | `/api/andon/filter?fromDate={date}&toDate={date}` | Get filtered data by date range |
| GET | `/api/andon/time-lost?lineId={id}` | Calculate time lost for a line |
| GET | `/api/andon/takt-time?lineId={id}` | Calculate takt time for a line |
| GET | `/api/andon/health` | Health check |

### Example Requests

**Get Current Shift:**
```bash
curl http://localhost:8080/api/andon/current-shift
```

**Get Day-Wise Data:**
```bash
curl "http://localhost:8080/api/andon/day-wise?lineId=1&date=11-02-2026"
```

**Update Actuals:**
```bash
curl -X POST http://localhost:8080/api/andon/update-actuals \
  -H "Content-Type: application/json" \
  -d '{"andonStationSummaryQueueId":123,"shiftActuals":150}'
```

**Calculate Takt Time:**
```bash
curl "http://localhost:8080/api/andon/takt-time?lineId=1"
```

---

## 📊 Takt Time Calculations

The service includes comprehensive production metric calculations:

### Takt Time
```
Takt Time = (Available Production Time / Customer Demand)
          = (Shift Duration - Breaks) × 3600 / Target Production
          [Result in seconds per unit]
```

### Line Efficiency
```
Line Efficiency = (Actual Output / Planned Output) × 100
```

### OEE (Overall Equipment Effectiveness)
```
OEE = Availability × Performance × Quality
```

See `TaktTimeCalculator.java` for all calculation formulas.

---

## ⚙️ Configuration

### Database Configuration

Update `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=mercedes_benz_db
spring.datasource.username=sa
spring.datasource.password=MercedesBenz2026!
```

### CORS Configuration

Configure allowed origins in `application.properties`:

```properties
cors.allowed-origins=http://localhost:5174,http://localhost:5173
```

---

## 🔄 Integration with React Frontend

The Java backend can run alongside or replace the Node.js backend:

### Option 1: Run Both (Recommended for Development)
- **Node.js Backend**: Port 3001 (existing audit routes)
- **Java Backend**: Port 8080 (andon routes)

Update React API calls to use:
```javascript
// For andon services
const JAVA_API_URL = 'http://localhost:8080/api';

// For audit logs
const NODE_API_URL = 'http://localhost:3001/api';
```

### Option 2: Java Only
- Migrate all routes to Java
- Update all React API calls to port 8080

---

## 📝 Comparison with iprod 2

This project modernizes the iprod 2 architecture:

| iprod 2 (Reference) | MB_JavaServices (New) |
|---------------------|----------------------|
| Struts 2 | Spring Boot 3.2 |
| Action Classes | Controllers |
| DAO Pattern | Spring Data JPA Repositories |
| DTO Pattern | DTO Pattern (same) |
| Manual SQL | JPA/Hibernate |
| XML Configuration | Annotation-based |
| log4j | SLF4J/Logback |

**API Mapping:**

| iprod 2 Method | MB_JavaServices Endpoint |
|----------------|--------------------------|
| `getAllDayWiseAndonDataDetails()` | `GET /andon/day-wise` |
| `getCurrentShiftDetails()` | `GET /andon/current-shift` |
| `updateAndonSummaryQueueDetails()` | `POST /andon/update-actuals` |
| `getActualFilterWise()` | `GET /andon/filter` |
| `getLineTimeLost()` | `GET /andon/time-lost` |

---

## 🧪 Testing

Run tests with:

```bash
mvn test
```

---

## 📦 Building for Production

Create an executable JAR:

```bash
mvn clean package -DskipTests
```

Output: `target/mercedes-benz-services-1.0.0.jar`

Run in production:

```bash
java -jar target/mercedes-benz-services-1.0.0.jar \
  --spring.profiles.active=prod \
  --spring.datasource.url=jdbc:sqlserver://prod-server:1433;databaseName=mercedes_benz_db
```

---

## 🔒 Security Considerations

For production:

1. **Change default passwords** in `application.properties`
2. **Enable Spring Security** for authentication
3. **Use environment variables** for sensitive data
4. **Enable HTTPS**
5. **Configure proper CORS** origins

---

## 📚 Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [SQL Server JDBC Driver](https://docs.microsoft.com/en-us/sql/connect/jdbc/)
- [Lombok](https://projectlombok.org/)

---

## 👥 Development Team

**Developed by:** ATS Conveyors I Pvt Ltd  
**Project:** Mercedes-Benz Digital Assembly Platform  
**Version:** 1.0.0  
**Date:** February 2026

---

## 📄 License

Proprietary - ATS Conveyors I Pvt Ltd

---

**Need help?** Contact the development team or refer to the documentation in the `docs/` folder of the main project.
