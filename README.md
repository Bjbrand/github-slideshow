# 🎵 Sonic Records - Recording Studio Management Platform

A comprehensive business management platform for recording studios featuring client portal, booking system, contract management, project tracking, and file sharing.

## 🌟 Features

### Client Features
- **Registration & Authentication**: Secure JWT-based authentication
- **Contract Management**: Electronic contract signing with IP/timestamp tracking
- **Session Booking**: Book recording sessions with service selection, date/time picker
- **Invoice Generation**: Automatic PDF invoice generation
- **Payment Upload**: Upload payment proof for verification
- **Project Dashboard**: Track all projects with status updates
- **File Management**: Download completed audio files and project deliverables
- **Revision Requests**: Submit revision requests with detailed notes
- **Timetable**: View confirmed booking schedule

### Admin Features
- **Admin Dashboard**: Overview of all studio operations
- **Client Management**: View and manage all registered clients
- **Payment Approval**: Review and approve payment proofs
- **Project Management**: Update project status (Pending → In Progress → Completed)
- **File Upload**: Upload completed files for client download
- **Booking Overview**: Manage all studio bookings and schedule

### Services Offered
- 🎤 **Recording**: Professional multi-track recording
- 🎵 **Mixing**: Expert audio mixing services
- 🎧 **Mastering**: Final mastering for distribution
- 🎼 **A Cappella**: Vocal isolation and enhancement

## 🎨 Design

The platform features a custom "Sonic Noir" design theme with:
- Dark mode aesthetic (#0a0a0a background)
- Electric Fuchsia (#d946ef) primary accent
- Syne font for headings
- Manrope font for body text
- JetBrains Mono for code/timestamps
- Glassmorphism effects and glow animations

## 🔐 Test Credentials

### Admin Access
- **Email**: admin@sonic.com
- **Password**: admin123

### Test Client
- **Email**: testclient@example.com
- **Password**: test123

## 🚀 Getting Started

The platform is already running and accessible at your preview URL.

### Key URLs
- Landing Page: `/`
- Registration: `/register`
- Login: `/login`
- Contract: `/contract` (requires login)
- Book Session: `/book` (requires login)
- Dashboard: `/dashboard` (requires login, routes to client/admin based on role)

## 📋 User Workflow

### For Clients:
1. Register an account → `/register`
2. Login → `/login`
3. Accept contract → `/contract`
4. Book a session → `/book`
5. Download invoice (PDF)
6. Upload payment proof
7. Wait for admin approval
8. Access project dashboard
9. Download completed files
10. Request revisions if needed

### For Admin:
1. Login with admin credentials
2. View pending payments
3. Approve payments (creates project automatically)
4. Update project status
5. Upload completed files
6. Manage all clients and bookings

## 🛠 Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: MongoDB
- **Authentication**: JWT with bcrypt
- **PDF Generation**: ReportLab
- **File Upload**: python-multipart

### Frontend
- **Framework**: React 19
- **UI Components**: Shadcn/UI with Radix UI
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Notifications**: Sonner

## 📁 Project Structure

```
/app/
├── backend/
│   ├── server.py          # FastAPI application with all routes
│   ├── .env              # Environment variables
│   ├── requirements.txt  # Python dependencies
│   └── uploads/          # File upload directory
├── frontend/
│   └── src/
│       ├── App.js                    # Main app component with routing
│       ├── pages/
│       │   ├── LandingPage.js       # Marketing landing page
│       │   ├── Register.js          # Client registration
│       │   ├── Login.js             # Authentication
│       │   ├── ContractPage.js      # Contract acceptance
│       │   ├── BookingPage.js       # Session booking
│       │   ├── ClientDashboard.js   # Client portal
│       │   ├── ProjectDetail.js     # Project management
│       │   └── AdminDashboard.js    # Admin panel
│       └── components/ui/           # Shadcn UI components
└── scripts/
    └── create_admin.py   # Admin user creation script

```

## 🔑 Environment Variables

### Backend (.env)
```
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
JWT_SECRET="sonic-records-secret-key-change-in-production-2025"
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://your-preview-url.emergentagent.com
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Contracts
- `GET /api/contract/pdf` - Download contract PDF
- `POST /api/contract/accept` - Accept contract
- `GET /api/contract/status` - Check contract status

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - List bookings
- `GET /api/bookings/{id}/invoice` - Download invoice
- `POST /api/bookings/{id}/payment-proof` - Upload payment proof
- `POST /api/bookings/{id}/approve-payment` - Approve payment (admin)

### Projects
- `GET /api/projects` - List projects
- `GET /api/projects/{id}` - Get project details
- `PATCH /api/projects/{id}/status` - Update status (admin)
- `POST /api/projects/{id}/files` - Upload file
- `GET /api/projects/{id}/files` - List project files

### Files
- `GET /api/files/{id}/download` - Download file

### Revisions
- `POST /api/revisions` - Create revision request
- `GET /api/projects/{id}/revisions` - List revisions

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/clients` - List all clients

## 🎯 Next Steps

Consider adding:
- Email notifications (SendGrid/Resend) for bookings and status updates
- WhatsApp notifications (Twilio)
- Online payment integration (Stripe/PayPal)
- Calendar integration (Google Calendar)
- Multi-file upload with drag-and-drop
- Audio player for file preview
- Advanced analytics dashboard
- Mobile app version

## 📝 Notes

- All passwords are hashed using bcrypt
- JWT tokens expire after 7 days
- File uploads are stored in `/app/backend/uploads/`
- Invoice pricing: $100/hour (customizable in code)
- Contract acceptance is tracked with IP address and timestamp for legal compliance

---

Built with ❤️ using Emergent AI Platform
