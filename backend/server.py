from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Request
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
import io
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION = timedelta(days=7)

# File upload directory
UPLOAD_DIR = ROOT_DIR / 'uploads'
UPLOAD_DIR.mkdir(exist_ok=True)

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Models
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    company_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: EmailStr
    role: str
    phone: Optional[str] = None
    company_name: Optional[str] = None
    created_at: str

class ContractAcceptance(BaseModel):
    user_id: str
    ip_address: str
    agreed_at: str

class BookingCreate(BaseModel):
    service_type: str
    date: str
    time: str
    duration: int
    project_duration_days: int = 7
    payment_percentage: int = 100
    notes: Optional[str] = None

class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    client_id: str
    client_name: str
    service_type: str
    date: str
    time: str
    duration: int
    notes: Optional[str] = None
    payment_status: str
    invoice_id: str
    created_at: str

class ProjectCreate(BaseModel):
    booking_id: str

class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    booking_id: str
    client_id: str
    client_name: str
    service_type: str
    status: str
    deadline: str
    created_at: str
    updated_at: str

class ProjectStatusUpdate(BaseModel):
    status: str

class RevisionCreate(BaseModel):
    project_id: str
    message: str

class Revision(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    project_id: str
    client_id: str
    client_name: str
    message: str
    created_at: str

class FileUploadResponse(BaseModel):
    id: str
    filename: str
    project_id: str
    uploaded_by: str
    created_at: str

class PaymentProofUpload(BaseModel):
    booking_id: str

# Auth Helper Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'role': role,
        'exp': datetime.now(timezone.utc) + JWT_EXPIRATION
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

async def require_admin(user: dict = Depends(get_current_user)):
    if user['role'] != 'admin':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user

# PDF Generation
def get_service_pricing(service_type: str) -> dict:
    """Get pricing information for a service"""
    pricing = {
        "Recording": {"price": 50000, "discount_available": True, "max_discount": 0.20},
        "Mixing": {"price": 70000, "discount_available": False, "max_discount": 0},
        "Mastering": {"price": 30000, "discount_available": False, "max_discount": 0},
        "A Cappella": {"price": 40000, "discount_available": False, "max_discount": 0},
        "Video Recording": {"price": 150000, "discount_available": True, "max_discount": 0.15},
        "Video Editing": {"price": 100000, "discount_available": True, "max_discount": 0.15}
    }
    return pricing.get(service_type, {"price": 50000, "discount_available": False, "max_discount": 0})

def generate_invoice_pdf(booking: dict, invoice_id: str) -> io.BytesIO:
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Header
    c.setFont("Helvetica-Bold", 24)
    c.drawString(1*inch, height - 1*inch, "BjBrands Studios")
    c.setFont("Helvetica", 12)
    c.drawString(1*inch, height - 1.3*inch, "Recording Studio")
    
    # Invoice Title
    c.setFont("Helvetica-Bold", 18)
    c.drawString(1*inch, height - 2*inch, f"INVOICE #{invoice_id[:8].upper()}")
    
    # Details
    c.setFont("Helvetica", 11)
    y = height - 2.5*inch
    c.drawString(1*inch, y, f"Date: {datetime.now(timezone.utc).strftime('%B %d, %Y')}")
    y -= 0.3*inch
    c.drawString(1*inch, y, f"Client: {booking['client_name']}")
    y -= 0.3*inch
    c.drawString(1*inch, y, f"Service: {booking['service_type']}")
    y -= 0.3*inch
    c.drawString(1*inch, y, f"Session Date: {booking['date']}")
    y -= 0.3*inch
    c.drawString(1*inch, y, f"Time: {booking['time']}")
    
    # Pricing
    pricing = get_service_pricing(booking['service_type'])
    base_price = pricing['price']
    payment_percentage = booking.get('payment_percentage', 100) / 100
    amount_due = int(base_price * payment_percentage)
    
    y -= 0.6*inch
    c.setFont("Helvetica", 11)
    c.drawString(1*inch, y, f"Service Price: TZS {base_price:,}")
    y -= 0.3*inch
    c.drawString(1*inch, y, f"Payment Percentage: {booking.get('payment_percentage', 100)}%")
    
    y -= 0.5*inch
    c.setFont("Helvetica-Bold", 14)
    c.drawString(1*inch, y, f"Amount Due: TZS {amount_due:,}")
    
    # Payment Methods
    y -= 0.8*inch
    c.setFont("Helvetica-Bold", 12)
    c.drawString(1*inch, y, "Payment Methods:")
    y -= 0.3*inch
    c.setFont("Helvetica", 10)
    c.drawString(1*inch, y, "Airtel Money: +255672991100")
    y -= 0.25*inch
    c.drawString(1*inch, y, "M-Pesa: +255766919083")
    y -= 0.25*inch
    c.drawString(1*inch, y, "Bank Transfer:")
    y -= 0.2*inch
    c.drawString(1.3*inch, y, "Account Number: 0152618979700")
    y -= 0.2*inch
    c.drawString(1.3*inch, y, "Account Name: Bwanga Josiah Tayali")
    
    # Footer
    c.setFont("Helvetica", 9)
    c.drawString(1*inch, 1.2*inch, "Payment must be completed before session date.")
    c.drawString(1*inch, 1*inch, "Master files and videos available for download after full payment.")
    
    c.save()
    buffer.seek(0)
    return buffer

def generate_contract_pdf() -> io.BytesIO:
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    c.setFont("Helvetica-Bold", 20)
    c.drawString(1*inch, height - 1*inch, "RECORDING SERVICES AGREEMENT")
    
    c.setFont("Helvetica", 11)
    y = height - 1.8*inch
    
    terms = [
        "1. The Client agrees to pay the full session fee before recording begins.",
        "2. Studio time is charged per hour with a minimum 2-hour booking.",
        "3. Cancellations require 48 hours notice for a full refund.",
        "4. The Client retains all rights to their recordings.",
        "5. The Studio may use recordings for portfolio purposes with permission.",
        "6. Two rounds of revisions are included in mixing/mastering services.",
        "7. Additional revisions are charged at $50 per revision.",
        "8. Files will be delivered within 7 business days of session completion.",
        "9. The Studio is not liable for equipment failure or data loss.",
        "10. By booking, the Client agrees to these terms and conditions."
    ]
    
    for term in terms:
        if y < 2*inch:
            c.showPage()
            c.setFont("Helvetica", 11)
            y = height - 1*inch
        c.drawString(0.75*inch, y, term)
        y -= 0.35*inch
    
    c.setFont("Helvetica-Oblique", 9)
    c.drawString(1*inch, 1.5*inch, "By clicking 'I Agree', you accept these terms.")
    
    c.save()
    buffer.seek(0)
    return buffer

# Routes
@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "role": "client",
        "phone": user_data.phone,
        "company_name": user_data.company_name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_token(user_id, user_data.email, "client")
    
    return {
        "user": User(**{k: v for k, v in user_doc.items() if k != 'password'}),
        "token": token
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'], user['email'], user['role'])
    
    return {
        "user": User(**{k: v for k, v in user.items() if k != 'password'}),
        "token": token
    }

@api_router.get("/auth/me", response_model=User)
async def get_me(user: dict = Depends(get_current_user)):
    user_doc = await db.users.find_one({"id": user['user_id']}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**{k: v for k, v in user_doc.items() if k != 'password'})

@api_router.get("/contract/pdf")
async def get_contract_pdf():
    pdf_buffer = generate_contract_pdf()
    return StreamingResponse(pdf_buffer, media_type="application/pdf", headers={"Content-Disposition": "inline; filename=contract.pdf"})

@api_router.post("/contract/accept")
async def accept_contract(request: Request, user: dict = Depends(get_current_user)):
    # Check if already accepted
    existing = await db.contracts.find_one({"user_id": user['user_id']}, {"_id": 0})
    if existing:
        return {"message": "Contract already accepted", "contract": existing}
    
    contract_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user['user_id'],
        "ip_address": request.client.host,
        "agreed_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.contracts.insert_one(contract_doc)
    return {"message": "Contract accepted", "contract": contract_doc}

@api_router.get("/contract/status")
async def check_contract_status(user: dict = Depends(get_current_user)):
    contract = await db.contracts.find_one({"user_id": user['user_id']}, {"_id": 0})
    return {"accepted": contract is not None, "contract": contract}

@api_router.post("/bookings", response_model=Booking)
async def create_booking(booking_data: BookingCreate, user: dict = Depends(get_current_user)):
    # Get user details
    user_doc = await db.users.find_one({"id": user['user_id']}, {"_id": 0})
    
    booking_id = str(uuid.uuid4())
    invoice_id = str(uuid.uuid4())
    
    booking_doc = {
        "id": booking_id,
        "client_id": user['user_id'],
        "client_name": user_doc['name'],
        "service_type": booking_data.service_type,
        "date": booking_data.date,
        "time": booking_data.time,
        "duration": booking_data.duration,
        "project_duration_days": booking_data.project_duration_days,
        "payment_percentage": booking_data.payment_percentage,
        "notes": booking_data.notes,
        "payment_status": "pending",
        "invoice_id": invoice_id,
        "payment_reminder_sent": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.bookings.insert_one(booking_doc)
    return Booking(**booking_doc)

@api_router.get("/bookings", response_model=List[Booking])
async def get_bookings(user: dict = Depends(get_current_user)):
    if user['role'] == 'admin':
        bookings = await db.bookings.find({}, {"_id": 0}).to_list(1000)
    else:
        bookings = await db.bookings.find({"client_id": user['user_id']}, {"_id": 0}).to_list(1000)
    return bookings

@api_router.get("/bookings/{booking_id}/invoice")
async def get_invoice(booking_id: str, user: dict = Depends(get_current_user)):
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if user['role'] != 'admin' and booking['client_id'] != user['user_id']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    pdf_buffer = generate_invoice_pdf(booking, booking['invoice_id'])
    return StreamingResponse(pdf_buffer, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=invoice_{booking['invoice_id'][:8]}.pdf"})

@api_router.post("/bookings/{booking_id}/payment-proof")
async def upload_payment_proof(booking_id: str, file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking['client_id'] != user['user_id']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Save file
    file_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"payment_{file_id}_{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update booking status
    await db.bookings.update_one(
        {"id": booking_id},
        {"$set": {"payment_status": "verification_pending", "payment_proof_path": str(file_path)}}
    )
    
    return {"message": "Payment proof uploaded successfully", "file_id": file_id}

@api_router.post("/bookings/{booking_id}/approve-payment")
async def approve_payment(booking_id: str, admin: dict = Depends(require_admin)):
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    await db.bookings.update_one(
        {"id": booking_id},
        {"$set": {"payment_status": "confirmed"}}
    )
    
    # Create project
    project_id = str(uuid.uuid4())
    deadline_date = (datetime.now(timezone.utc) + timedelta(days=booking.get('project_duration_days', 7))).isoformat()
    project_doc = {
        "id": project_id,
        "booking_id": booking_id,
        "client_id": booking['client_id'],
        "client_name": booking['client_name'],
        "service_type": booking['service_type'],
        "status": "pending",
        "progress_percentage": 0,
        "deadline": deadline_date,
        "deadline_reminder_sent": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.projects.insert_one(project_doc)
    
    return {"message": "Payment approved and project created", "project_id": project_id}

@api_router.get("/projects", response_model=List[Project])
async def get_projects(user: dict = Depends(get_current_user)):
    if user['role'] == 'admin':
        projects = await db.projects.find({}, {"_id": 0}).to_list(1000)
    else:
        projects = await db.projects.find({"client_id": user['user_id']}, {"_id": 0}).to_list(1000)
    return projects

@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str, user: dict = Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if user['role'] != 'admin' and project['client_id'] != user['user_id']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return project

@api_router.patch("/projects/{project_id}/status")
async def update_project_status(project_id: str, status_update: ProjectStatusUpdate, admin: dict = Depends(require_admin)):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Calculate progress percentage based on status
    progress_map = {
        "pending": 0,
        "in_progress": 50,
        "revision_requested": 75,
        "completed": 100
    }
    progress = progress_map.get(status_update.status, 0)
    
    await db.projects.update_one(
        {"id": project_id},
        {"$set": {
            "status": status_update.status,
            "progress_percentage": progress,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"message": "Project status updated", "progress": progress}

@api_router.post("/projects/{project_id}/files")
async def upload_project_file(project_id: str, file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if user['role'] != 'admin' and project['client_id'] != user['user_id']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    file_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"project_{project_id}_{file_id}_{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    file_doc = {
        "id": file_id,
        "project_id": project_id,
        "filename": file.filename,
        "file_path": str(file_path),
        "uploaded_by": user['user_id'],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.files.insert_one(file_doc)
    
    return FileUploadResponse(**{k: v for k, v in file_doc.items() if k != 'file_path'})

@api_router.get("/projects/{project_id}/files")
async def get_project_files(project_id: str, user: dict = Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if user['role'] != 'admin' and project['client_id'] != user['user_id']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    files = await db.files.find({"project_id": project_id}, {"_id": 0, "file_path": 0}).to_list(1000)
    return files

@api_router.get("/files/{file_id}/download")
async def download_file(file_id: str, user: dict = Depends(get_current_user)):
    file_doc = await db.files.find_one({"id": file_id}, {"_id": 0})
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")
    
    project = await db.projects.find_one({"id": file_doc['project_id']}, {"_id": 0})
    if user['role'] != 'admin' and project['client_id'] != user['user_id']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Check if payment is 100% complete for clients
    if user['role'] != 'admin':
        booking = await db.bookings.find_one({"id": project['booking_id']}, {"_id": 0})
        if booking and booking.get('payment_percentage', 0) < 100:
            raise HTTPException(
                status_code=403, 
                detail="Download available only after 100% payment is completed"
            )
        if booking and booking.get('payment_status') != 'confirmed':
            raise HTTPException(
                status_code=403, 
                detail="Download available only after payment is confirmed"
            )
    
    file_path = Path(file_doc['file_path'])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    return FileResponse(file_path, filename=file_doc['filename'])

@api_router.post("/revisions", response_model=Revision)
async def create_revision(revision_data: RevisionCreate, user: dict = Depends(get_current_user)):
    project = await db.projects.find_one({"id": revision_data.project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project['client_id'] != user['user_id']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    revision_id = str(uuid.uuid4())
    user_doc = await db.users.find_one({"id": user['user_id']}, {"_id": 0})
    
    revision_doc = {
        "id": revision_id,
        "project_id": revision_data.project_id,
        "client_id": user['user_id'],
        "client_name": user_doc['name'],
        "message": revision_data.message,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.revisions.insert_one(revision_doc)
    
    # Update project status
    await db.projects.update_one(
        {"id": revision_data.project_id},
        {"$set": {"status": "revision_requested", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return Revision(**revision_doc)

@api_router.get("/projects/{project_id}/revisions", response_model=List[Revision])
async def get_revisions(project_id: str, user: dict = Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if user['role'] != 'admin' and project['client_id'] != user['user_id']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    revisions = await db.revisions.find({"project_id": project_id}, {"_id": 0}).to_list(1000)
    return revisions

@api_router.get("/admin/dashboard")
async def get_admin_dashboard(admin: dict = Depends(require_admin)):
    total_clients = await db.users.count_documents({"role": "client"})
    total_projects = await db.projects.count_documents({})
    total_bookings = await db.bookings.count_documents({})
    pending_payments = await db.bookings.count_documents({"payment_status": "verification_pending"})
    
    return {
        "total_clients": total_clients,
        "total_projects": total_projects,
        "total_bookings": total_bookings,
        "pending_payments": pending_payments
    }

@api_router.get("/admin/clients")
async def get_all_clients(admin: dict = Depends(require_admin)):
    clients = await db.users.find({"role": "client"}, {"_id": 0, "password": 0}).to_list(1000)
    return clients

@api_router.get("/admin/payment-reminders")
async def get_payment_reminders(admin: dict = Depends(require_admin)):
    # Get bookings with pending or verification_pending payment older than 2 days
    two_days_ago = (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
    bookings = await db.bookings.find({
        "payment_status": {"$in": ["pending", "verification_pending"]},
        "created_at": {"$lt": two_days_ago},
        "payment_reminder_sent": False
    }, {"_id": 0}).to_list(1000)
    return bookings

@api_router.get("/admin/deadline-reminders")
async def get_deadline_reminders(admin: dict = Depends(require_admin)):
    # Get projects approaching deadline (within 2 days) and not completed
    two_days_from_now = (datetime.now(timezone.utc) + timedelta(days=2)).isoformat()
    projects = await db.projects.find({
        "status": {"$ne": "completed"},
        "deadline": {"$lt": two_days_from_now},
        "deadline_reminder_sent": False
    }, {"_id": 0}).to_list(1000)
    return projects

@api_router.post("/admin/send-payment-reminder/{booking_id}")
async def send_payment_reminder(booking_id: str, admin: dict = Depends(require_admin)):
    await db.bookings.update_one(
        {"id": booking_id},
        {"$set": {"payment_reminder_sent": True}}
    )
    return {"message": "Payment reminder marked as sent"}

@api_router.post("/admin/send-deadline-reminder/{project_id}")
async def send_deadline_reminder(project_id: str, admin: dict = Depends(require_admin)):
    await db.projects.update_one(
        {"id": project_id},
        {"$set": {"deadline_reminder_sent": True}}
    )
    return {"message": "Deadline reminder marked as sent"}

@api_router.get("/files/{file_id}/preview")
async def preview_file(file_id: str, user: dict = Depends(get_current_user)):
    file_doc = await db.files.find_one({"id": file_id}, {"_id": 0})
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")
    
    project = await db.projects.find_one({"id": file_doc['project_id']}, {"_id": 0})
    if user['role'] != 'admin' and project['client_id'] != user['user_id']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    file_path = Path(file_doc['file_path'])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    # Return file for streaming (preview only)
    return FileResponse(
        file_path,
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f"inline; filename={file_doc['filename']}",
            "X-Content-Type-Options": "nosniff"
        }
    )

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()