# Mercedes-Benz Digital Assembly Platform
## Professional File Structure

```
mercedes-benz-react-app/
│
├── 📁 config/                          # Configuration files
│   ├── .env.example                     # Environment template
│   └── email.config.js                  # Email configuration (future)
│
├── 📁 data/                            # Data storage
│   ├── audit-reports/                   # Audit trail data
│   │   └── Audit_Trial_Report_AutoSave/ # Date-based folders
│   └── exports/                         # Excel exports, reports
│
├── 📁 docs/                            # Documentation
│   ├── business/                        # Business documentation
│   │   ├── PROJECT_BUSINESS_CASE.md    # Full business case
│   │   └── EXECUTIVE_SUMMARY.md        # Quick reference
│   ├── technical/                       # Technical documentation
│   │   ├── EMAIL_IMPLEMENTATION_SUMMARY.md
│   │   ├── STICKY_FOOTER_FEATURE.md
│   │   └── ARCHITECTURE.md             # System architecture
│   ├── setup/                           # Setup guides
│   │   ├── EMAIL_SETUP.md              # Email configuration
│   │   ├── INSTALLATION.md             # Installation guide
│   │   └── DEPLOYMENT.md               # Deployment guide
│   ├── api/                             # API documentation
│   │   └── API_REFERENCE.md            # API endpoints
│   └── README.md                        # Docs index
│
├── 📁 examples/                        # Example implementations
│   └── thin-client/                     # Thin client demo
│       ├── index.html
│       └── ThinClientApiTest.html
│
├── 📁 public/                          # Static assets
│   ├── assets/                          # Images, logos, icons
│   │   ├── ATS_Logo.png
│   │   └── Mercedes-Benz_Logo.png
│   └── videos/                          # Video files
│       └── Mercedes-Benz Concept A Sedan_ Trailer.mp4
│
├── 📁 scripts/                         # Utility scripts
│   ├── setup.sh                         # Initial setup script
│   ├── backup-data.sh                   # Data backup script
│   └── deploy.sh                        # Deployment script
│
├── 📁 server/                          # Backend code
│   ├── index.js                         # Main server file (from server.js)
│   ├── config/                          # Server configuration
│   │   └── database.js
│   ├── routes/                          # API routes
│   │   ├──  email.routes.js
│   │   ├── audit.routes.js
│   │   └── auth.routes.js
│   ├── controllers/                     # Request handlers
│   ├── middleware/                      # Express middleware
│   │   ├── auth.middleware.js
│   │   └── errorHandler.js
│   └── utils/                           # Server utilities
│       └── fileSystem.js
│
├── 📁 services/                        # Business logic services
│   ├── emailService.js                  # Email service
│   ├── auditService.js                  # Audit logging
│   └── authService.js                   # Authentication
│
├── 📁 src/                             # Frontend source code
│   ├── assets/                          # Frontend assets
│   │   ├── images/
│   │   ├── fonts/
│   │   └── videos/
│   │
│   ├── components/                      # Reusable components
│   │   ├── common/                      # Common UI components
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   ├── Table/
│   │   │   └── Modal/
│   │   ├── charts/                      # Chart components
│   │   └── forms/                       # Form components
│   │
│   ├── context/                         # React Context
│   │   ├── AuthContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── NotificationContext.jsx
│   │
│   ├── hooks/                           # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useApi.js
│   │   └── useLocalStorage.js
│   │
│   ├── layouts/                         # Layout components
│   │   ├── MainLayout.jsx
│   │   ├── MainLayout.css
│   │   ├── Header.jsx
│   │   ├── Header.css
│   │   ├── Sidebar.jsx
│   │   ├── Sidebar.css
│   │   ├── Footer.jsx
│   │   └── Footer.css
│   │
│   ├── pages/                           # Page components
│   │   ├── Auth/                        # Authentication pages
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── AccessMatrix.jsx
│   │   ├── Dashboard/                   # Dashboard pages
│   │   │   └── Dashboard.jsx
│   │   ├── Andon/                       # Andon system pages
│   │   │   ├── Trim4.jsx
│   │   │   ├── Trim5.jsx
│   │   │   └── ...
│   │   ├── Breakdown/                   # Breakdown pages
│   │   ├── Management/                  # Management pages
│   │   ├── Reports/                     # Report pages
│   │   │   └── AuditTrail.jsx
│   │   └── Stakeholder/                 # Stakeholder pages
│   │
│   ├── services/                        # Frontend API services
│   │   ├── api.js                       # API client
│   │   ├── authApi.js                   # Auth API calls
│   │   └── auditApi.js                  # Audit API calls
│   │
│   ├── styles/                          # Global styles
│   │   ├── index.css                    # Main styles
│   │   ├── variables.css                # CSS variables
│   │   └── utilities.css                # Utility classes
│   │
│   ├── utils/                           # Utility functions
│   │   ├── constants.js                 # Constants
│   │   ├── helpers.js                   # Helper functions
│   │   └── validators.js                # Validation functions
│   │
│   ├── App.jsx                          # Main App component
│   └── main.jsx                         # Entry point
│
├── 📁 tests/                           # Test files
│   ├── unit/                            # Unit tests
│   ├── integration/                     # Integration tests
│   └── e2e/                             # End-to-end tests
│
├── .env                                 # Environment variables (gitignored)
├── .env.example                         # Environment template
├── .gitignore                           # Git ignore rules
├── eslint.config.js                     # ESLint configuration
├── index.html                           # HTML entry point
├── package.json                         # Project dependencies
├── package-lock.json                    # Locked dependencies
├── vite.config.js                       # Vite configuration
└── README.md                            # Project overview
```

## 📋 Folder Purpose

| Folder | Purpose | Contents |
|--------|---------|----------|
| `config/` | Configuration files | Environment templates, app config |
| `data/` | Application data | Audit logs, exports, backups |
| `docs/` | Documentation | Business, technical, setup guides |
| `examples/` | Code examples | Demo implementations, samples |
| `public/` | Static assets | Images, videos, fonts (served as-is) |
| `scripts/` | Utility scripts | Setup, deployment, backup scripts |
| `server/` | Backend code | Express server, routes, controllers |
| `services/` | Business services | Email, auth, audit services |
| `src/` | Frontend code | React components, pages, styles |
| `tests/` | Test suites | Unit, integration, E2E tests |

## 🎯 Benefits of This Structure

### ✅ Clear Separation of Concerns
- Backend (`server/`) separate from frontend (`src/`)
- Documentation organized by type
- Data isolated in `data/` folder

### ✅ Scalability
- Easy to add new features
- Clear where new files belong
- Modular architecture

### ✅ Professional Standards
- Follows industry best practices
- Easy for new developers to understand
- Consistent with enterprise projects

### ✅ Maintainability
- Related files grouped together
- Easy to find specific functionality
- Clear naming conventions

### ✅ Deployment Ready
- Static assets in `public/`
- Scripts for automation
- Environment configuration separated

## 📝 Migration Notes

### Files to Move:
1. **server.js** → `server/index.js`
2. **Documentation** → `docs/` subdirectories
3. **ThinClientDemo** → `examples/thin-client/`
4. **Audit_Trial_Report_AutoSave** → `data/audit-reports/`
5. **Video file** → `public/videos/`

### Import Path Updates:
Update imports in moved files to reflect new structure.

### .gitignore Updates:
```
# Data files
/data/audit-reports/*
!/data/audit-reports/ .gitkeep
/data/exports/*

# Environment
.env
.env.local

#  Configuration
config/*.local.js
```

## 🚀 Next Phase Enhancements

### Phase 1: Current Reorganization
- Folder structure setup ✅
- File movement
- Import path updates
- Documentation updates

### Phase 2: Code Splitting
- Separate route files
- Controller extraction
- Service layer enhancement

### Phase 3: Testing Infrastructure
- Jest setup
- Test file structure
- CI/CD integration

### Phase 4: Advanced Features
- API documentation (Swagger)
- Automated backups
- Deployment scripts
- Monitoring setup

## 📌 Implementation Checklist

- [ ] Create folder structure
- [ ] Move documentation files
- [ ] Move data files
- [ ] Move example files
- [ ] Reorganize server code
- [ ] Update import paths
- [ ] Update .gitignore
- [ ] Test application still works
- [ ] Update README with new structure
- [ ] Commit to Koustubh branch
- [ ] Create migration guide

## 🔗 References

This structure follows:
- React best practices
- Node.js/Express conventions
- Enterprise application standards
- Monorepo patterns (modified for single repo)

---

**Note:** This is a non-breaking reorganization. All functionality remains intact.
