# 🚀 Quick Start Guide - Mercedes-Benz Backend Services

## Choose Your Backend

### Option 1: Node.js/Express (Faster, Simpler)
```bash
# Already running
npm run dev

# API: http://localhost:3001/api/andon/
```

### Option 2: Java/Spring Boot (Enterprise, Robust)
```bash
cd MB_JavaServices
mvn spring-boot:run

# API: http://localhost:8080/api/andon/
```

---

## API Endpoints

Both backends provide the same endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/current-shift` | GET | Current shift data |
| `/day-wise?lineId=1` | GET | Day production |
| `/takt-time?lineId=1` | GET | Takt time calc |
| `/time-lost?lineId=1` | GET | Downtime |
| `/update-actuals` | POST | Update production |
| `/filter?fromDate=...&toDate=...` | GET | Date range filter |

---

## Test API

```bash
# Node.js (port 3001)
curl http://localhost:3001/api/andon/current-shift

# Java (port 8080)
curl http://localhost:8080/api/andon/current-shift
```

---

## React Integration

```javascript
// src/services/andonService.js
const API_URL = 'http://localhost:8080/api/andon'; // or 3001

export const getCurrentShift = async () => {
  const response = await fetch(`${API_URL}/current-shift`);
  const data = await response.json();
  return data.status === 1 ? data.data : [];
};
```

---

## Database Connection

**Both use:**
- Server: localhost:1433
- Database: mercedes_benz_db
- User: sa
- Password: MercedesBenz2026!

---

## Quick Reference

**Node.js:** `server/routes/andonRoutes.js`  
**Java:** `MB_JavaServices/src/main/java/com/ats/mercedesbenz/`  
**Docs:** `BACKEND_IMPLEMENTATION_SUMMARY.md`

---

**Ready to go!** 🎉
