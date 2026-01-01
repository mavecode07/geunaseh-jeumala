from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.responses import FileResponse
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import aiofiles
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'geunaseh_jeumala')]

# JWT Settings
SECRET_KEY = os.environ.get('JWT_SECRET', 'geunaseh-jeumala-secret-key-2025')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Secret code for admin access
ADMIN_SECRET_CODE = "<Mavecode300107>"

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security
security = HTTPBearer()

# Create the main app
app = FastAPI(title="Geunaseh Jeumala API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class UserCreate(BaseModel):
    username: str
    password: str
    secretCode: str
    fullName: Optional[str] = ""

class UserLogin(BaseModel):
    username: str
    password: str
    secretCode: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    fullName: Optional[str] = ""
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: User

# Page Content
class PageContentCreate(BaseModel):
    pageId: str
    heroTitle: Optional[str] = ""
    heroSubtitle: Optional[str] = ""
    heroDescription: Optional[str] = ""
    heroImage: Optional[str] = ""
    sections: Optional[List[dict]] = []

class PageContent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    pageId: str
    heroTitle: Optional[str] = ""
    heroSubtitle: Optional[str] = ""
    heroDescription: Optional[str] = ""
    heroImage: Optional[str] = ""
    sections: Optional[List[dict]] = []
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Article
class ArticleCreate(BaseModel):
    title: str
    slug: str
    summary: Optional[str] = ""
    content: Optional[str] = ""
    coverImage: Optional[str] = ""
    tags: Optional[List[str]] = []

class Article(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    summary: Optional[str] = ""
    content: Optional[str] = ""
    coverImage: Optional[str] = ""
    tags: Optional[List[str]] = []
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Media
class MediaCreate(BaseModel):
    title: str
    type: str  # image or video
    url: Optional[str] = ""
    description: Optional[str] = ""

class Media(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    type: str
    url: Optional[str] = ""
    description: Optional[str] = ""
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Documentation, Activity, Report
class DocumentCreate(BaseModel):
    title: str
    slug: str
    description: Optional[str] = ""
    content: Optional[str] = ""
    attachments: Optional[List[str]] = []
    docType: str  # documentation, activity, report

class Document(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    description: Optional[str] = ""
    content: Optional[str] = ""
    attachments: Optional[List[str]] = []
    docType: str
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Event
class EventCreate(BaseModel):
    title: str
    slug: str
    date: str
    time: Optional[str] = ""
    location: Optional[str] = ""
    description: Optional[str] = ""
    bannerImage: Optional[str] = ""
    capacity: Optional[int] = 0

class Event(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    date: str
    time: Optional[str] = ""
    location: Optional[str] = ""
    description: Optional[str] = ""
    bannerImage: Optional[str] = ""
    capacity: Optional[int] = 0
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Event Registration
class EventRegistrationCreate(BaseModel):
    eventId: str
    fullName: str
    email: str
    phone: str
    organization: Optional[str] = ""
    notes: Optional[str] = ""

class EventRegistration(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    eventId: str
    fullName: str
    email: str
    phone: str
    organization: Optional[str] = ""
    notes: Optional[str] = ""
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Task (AI Personal Agent)
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    dueDate: Optional[str] = ""
    assignee: Optional[str] = ""
    priority: Optional[str] = "medium"  # low, medium, high
    status: Optional[str] = "pending"  # pending, in_progress, done
    remindAt: Optional[str] = ""

class Task(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = ""
    dueDate: Optional[str] = ""
    assignee: Optional[str] = ""
    priority: Optional[str] = "medium"
    status: Optional[str] = "pending"
    remindAt: Optional[str] = ""
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Member (for Galaxy effect)
class Member(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    position: Optional[str] = ""
    division: Optional[str] = ""

# ==================== HELPERS ====================

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def serialize_datetime(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/signup", response_model=TokenResponse)
async def signup(user_data: UserCreate):
    # Verify secret code
    if user_data.secretCode != ADMIN_SECRET_CODE:
        raise HTTPException(status_code=403, detail="Secret code invalid")
    
    # Check if username exists
    existing = await db.users.find_one({"username": user_data.username})
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Create user
    user_obj = User(
        username=user_data.username,
        fullName=user_data.fullName or user_data.username
    )
    user_dict = user_obj.model_dump()
    user_dict["password"] = get_password_hash(user_data.password)
    user_dict["createdAt"] = user_dict["createdAt"].isoformat()
    
    await db.users.insert_one(user_dict)
    
    # Create token
    access_token = create_access_token({"sub": user_obj.id})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_obj
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    # Verify secret code
    if user_data.secretCode != ADMIN_SECRET_CODE:
        raise HTTPException(status_code=403, detail="Secret code invalid")
    
    # Find user
    user = await db.users.find_one({"username": user_data.username})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create token
    access_token = create_access_token({"sub": user["id"]})
    
    user_obj = User(
        id=user["id"],
        username=user["username"],
        fullName=user.get("fullName", "")
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_obj
    )

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

# ==================== PAGE CONTENT ROUTES ====================

@api_router.get("/pages")
async def get_all_pages():
    pages = await db.pages.find({}, {"_id": 0}).to_list(100)
    return pages

@api_router.get("/pages/{page_id}")
async def get_page(page_id: str):
    page = await db.pages.find_one({"pageId": page_id}, {"_id": 0})
    if not page:
        # Return default content
        return {
            "pageId": page_id,
            "heroTitle": "",
            "heroSubtitle": "",
            "heroDescription": "",
            "heroImage": "",
            "sections": []
        }
    return page

@api_router.post("/pages")
async def create_or_update_page(page_data: PageContentCreate, current_user: dict = Depends(get_current_user)):
    existing = await db.pages.find_one({"pageId": page_data.pageId})
    
    page_dict = page_data.model_dump()
    page_dict["updatedAt"] = datetime.now(timezone.utc).isoformat()
    
    if existing:
        await db.pages.update_one({"pageId": page_data.pageId}, {"$set": page_dict})
    else:
        page_dict["id"] = str(uuid.uuid4())
        await db.pages.insert_one(page_dict)
    
    return {"success": True}

# ==================== ARTICLE ROUTES ====================

@api_router.get("/articles")
async def get_articles():
    articles = await db.articles.find({}, {"_id": 0}).sort("createdAt", -1).to_list(100)
    return articles

@api_router.get("/articles/{slug}")
async def get_article(slug: str):
    article = await db.articles.find_one({"slug": slug}, {"_id": 0})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article

@api_router.post("/articles")
async def create_article(article_data: ArticleCreate, current_user: dict = Depends(get_current_user)):
    article_obj = Article(**article_data.model_dump())
    article_dict = article_obj.model_dump()
    article_dict["createdAt"] = article_dict["createdAt"].isoformat()
    article_dict["updatedAt"] = article_dict["updatedAt"].isoformat()
    await db.articles.insert_one(article_dict)
    article_dict.pop("_id", None)
    return article_dict

@api_router.put("/articles/{article_id}")
async def update_article(article_id: str, article_data: ArticleCreate, current_user: dict = Depends(get_current_user)):
    update_dict = article_data.model_dump()
    update_dict["updatedAt"] = datetime.now(timezone.utc).isoformat()
    result = await db.articles.update_one({"id": article_id}, {"$set": update_dict})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"success": True}

@api_router.delete("/articles/{article_id}")
async def delete_article(article_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.articles.delete_one({"id": article_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"success": True}

# ==================== MEDIA ROUTES ====================

@api_router.get("/media")
async def get_media():
    media = await db.media.find({}, {"_id": 0}).sort("createdAt", -1).to_list(100)
    return media

@api_router.post("/media")
async def create_media(media_data: MediaCreate, current_user: dict = Depends(get_current_user)):
    media_obj = Media(**media_data.model_dump())
    media_dict = media_obj.model_dump()
    media_dict["createdAt"] = media_dict["createdAt"].isoformat()
    await db.media.insert_one(media_dict)
    media_dict.pop("_id", None)
    return media_dict

@api_router.delete("/media/{media_id}")
async def delete_media(media_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.media.delete_one({"id": media_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Media not found")
    return {"success": True}

# ==================== DOCUMENT ROUTES (Documentation, Activity, Report) ====================

@api_router.get("/documents")
async def get_documents(doc_type: Optional[str] = None):
    query = {}
    if doc_type:
        query["docType"] = doc_type
    documents = await db.documents.find(query, {"_id": 0}).sort("createdAt", -1).to_list(100)
    return documents

@api_router.get("/documents/{slug}")
async def get_document(slug: str):
    doc = await db.documents.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@api_router.post("/documents")
async def create_document(doc_data: DocumentCreate, current_user: dict = Depends(get_current_user)):
    doc_obj = Document(**doc_data.model_dump())
    doc_dict = doc_obj.model_dump()
    doc_dict["createdAt"] = doc_dict["createdAt"].isoformat()
    doc_dict["updatedAt"] = doc_dict["updatedAt"].isoformat()
    await db.documents.insert_one(doc_dict)
    doc_dict.pop("_id", None)
    return doc_dict
    await db.documents.insert_one(doc_dict)
    return doc_dict

@api_router.put("/documents/{doc_id}")
async def update_document(doc_id: str, doc_data: DocumentCreate, current_user: dict = Depends(get_current_user)):
    update_dict = doc_data.model_dump()
    update_dict["updatedAt"] = datetime.now(timezone.utc).isoformat()
    result = await db.documents.update_one({"id": doc_id}, {"$set": update_dict})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"success": True}

@api_router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.documents.delete_one({"id": doc_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"success": True}

# ==================== EVENT ROUTES ====================

@api_router.get("/events")
async def get_events():
    events = await db.events.find({}, {"_id": 0}).sort("date", -1).to_list(100)
    return events

@api_router.get("/events/{slug}")
async def get_event(slug: str):
    event = await db.events.find_one({"slug": slug}, {"_id": 0})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@api_router.post("/events")
async def create_event(event_data: EventCreate, current_user: dict = Depends(get_current_user)):
    event_obj = Event(**event_data.model_dump())
    event_dict = event_obj.model_dump()
    event_dict["createdAt"] = event_dict["createdAt"].isoformat()
    event_dict["updatedAt"] = event_dict["updatedAt"].isoformat()
    await db.events.insert_one(event_dict)
    event_dict.pop("_id", None)
    return event_dict

@api_router.put("/events/{event_id}")
async def update_event(event_id: str, event_data: EventCreate, current_user: dict = Depends(get_current_user)):
    update_dict = event_data.model_dump()
    update_dict["updatedAt"] = datetime.now(timezone.utc).isoformat()
    result = await db.events.update_one({"id": event_id}, {"$set": update_dict})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"success": True}

@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"success": True}

# ==================== EVENT REGISTRATION ROUTES ====================

@api_router.post("/events/{event_id}/register")
async def register_event(event_id: str, reg_data: EventRegistrationCreate):
    # Check event exists
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    reg_obj = EventRegistration(eventId=event_id, **{k: v for k, v in reg_data.model_dump().items() if k != 'eventId'})
    reg_dict = reg_obj.model_dump()
    reg_dict["createdAt"] = reg_dict["createdAt"].isoformat()
    await db.registrations.insert_one(reg_dict)
    return {"success": True, "message": "Pendaftaran berhasil!"}

@api_router.get("/events/{event_id}/registrations")
async def get_event_registrations(event_id: str, current_user: dict = Depends(get_current_user)):
    regs = await db.registrations.find({"eventId": event_id}, {"_id": 0}).to_list(1000)
    return regs

@api_router.get("/registrations/export/{event_id}")
async def export_registrations(event_id: str, current_user: dict = Depends(get_current_user)):
    regs = await db.registrations.find({"eventId": event_id}, {"_id": 0}).to_list(1000)
    return regs

# ==================== TASK ROUTES (AI Personal Agent) ====================

@api_router.get("/tasks")
async def get_tasks(status: Optional[str] = None, assignee: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if status:
        query["status"] = status
    if assignee:
        query["assignee"] = assignee
    tasks = await db.tasks.find(query, {"_id": 0}).sort("createdAt", -1).to_list(100)
    return tasks

@api_router.post("/tasks")
async def create_task(task_data: TaskCreate, current_user: dict = Depends(get_current_user)):
    task_obj = Task(**task_data.model_dump())
    task_dict = task_obj.model_dump()
    task_dict["createdAt"] = task_dict["createdAt"].isoformat()
    task_dict["updatedAt"] = task_dict["updatedAt"].isoformat()
    await db.tasks.insert_one(task_dict)
    task_dict.pop("_id", None)
    return task_dict

@api_router.put("/tasks/{task_id}")
async def update_task(task_id: str, task_data: TaskCreate, current_user: dict = Depends(get_current_user)):
    update_dict = task_data.model_dump()
    update_dict["updatedAt"] = datetime.now(timezone.utc).isoformat()
    result = await db.tasks.update_one({"id": task_id}, {"$set": update_dict})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"success": True}

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.tasks.delete_one({"id": task_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"success": True}

# Mock AI Agent endpoint
@api_router.post("/ai-agent")
async def ai_agent(input_data: dict, current_user: dict = Depends(get_current_user)):
    """
    Mock AI Agent - converts natural language to task
    In the future, this will integrate with actual LLM
    """
    text = input_data.get("text", "")
    
    # Simple mock parsing
    task = {
        "title": text[:50] if len(text) > 50 else text,
        "description": text,
        "priority": "medium",
        "status": "pending",
        "dueDate": "",
        "assignee": "",
        "remindAt": ""
    }
    
    return {
        "success": True,
        "message": "Task berhasil dibuat dari input natural language (mock)",
        "task": task
    }

# ==================== MEMBER ROUTES (for Galaxy effect) ====================

@api_router.get("/members")
async def get_members():
    members = await db.members.find({}, {"_id": 0}).to_list(200)
    return members

@api_router.post("/members")
async def create_member(name: str = Form(...), position: str = Form(""), division: str = Form(""), current_user: dict = Depends(get_current_user)):
    member = Member(name=name, position=position, division=division)
    member_dict = member.model_dump()
    await db.members.insert_one(member_dict)
    member_dict.pop("_id", None)
    return member_dict

@api_router.put("/members/{member_id}")
async def update_member(member_id: str, name: str = Form(...), position: str = Form(""), division: str = Form(""), current_user: dict = Depends(get_current_user)):
    update_dict = {"name": name, "position": position, "division": division}
    result = await db.members.update_one({"id": member_id}, {"$set": update_dict})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"success": True}

@api_router.delete("/members/{member_id}")
async def delete_member(member_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.members.delete_one({"id": member_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"success": True}

# ==================== FILE UPLOAD ====================

@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    file_id = str(uuid.uuid4())
    file_ext = file.filename.split(".")[-1] if "." in file.filename else ""
    filename = f"{file_id}.{file_ext}" if file_ext else file_id
    
    file_path = UPLOAD_DIR / filename
    
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    return {"url": f"/api/uploads/{filename}", "filename": filename}

@api_router.get("/uploads/{filename}")
async def get_upload(filename: str):
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

# ==================== SEED DATA ====================

@api_router.post("/seed")
async def seed_data():
    """Seed database with sample data"""
    
    # Seed members for Galaxy effect
    sample_members = [
        {"id": str(uuid.uuid4()), "name": "Ahmad Rizki", "position": "Ketua", "division": "Pengurus Inti"},
        {"id": str(uuid.uuid4()), "name": "Siti Nurhaliza", "position": "Wakil Ketua", "division": "Pengurus Inti"},
        {"id": str(uuid.uuid4()), "name": "Muhammad Faisal", "position": "Sekretaris", "division": "Pengurus Inti"},
        {"id": str(uuid.uuid4()), "name": "Fatimah Zahra", "position": "Bendahara", "division": "Pengurus Inti"},
        {"id": str(uuid.uuid4()), "name": "Umar Abdullah", "position": "Koordinator", "division": "Divisi Pendidikan"},
        {"id": str(uuid.uuid4()), "name": "Aisyah Putri", "position": "Anggota", "division": "Divisi Pendidikan"},
        {"id": str(uuid.uuid4()), "name": "Hasan Ali", "position": "Koordinator", "division": "Divisi Dakwah"},
        {"id": str(uuid.uuid4()), "name": "Khadijah Sari", "position": "Anggota", "division": "Divisi Dakwah"},
        {"id": str(uuid.uuid4()), "name": "Ibrahim Yusuf", "position": "Koordinator", "division": "Divisi Sosial"},
        {"id": str(uuid.uuid4()), "name": "Maryam Dewi", "position": "Anggota", "division": "Divisi Sosial"},
        {"id": str(uuid.uuid4()), "name": "Yusuf Hakim", "position": "Koordinator", "division": "Divisi Media"},
        {"id": str(uuid.uuid4()), "name": "Zainab Aulia", "position": "Anggota", "division": "Divisi Media"},
        {"id": str(uuid.uuid4()), "name": "Bilal Rahman", "position": "Anggota", "division": "Divisi Pendidikan"},
        {"id": str(uuid.uuid4()), "name": "Sumayyah Indah", "position": "Anggota", "division": "Divisi Dakwah"},
        {"id": str(uuid.uuid4()), "name": "Salman Alfarisi", "position": "Anggota", "division": "Divisi Sosial"},
        {"id": str(uuid.uuid4()), "name": "Hafshah Lestari", "position": "Anggota", "division": "Divisi Media"},
        {"id": str(uuid.uuid4()), "name": "Thariq Aditya", "position": "Anggota", "division": "Divisi Pendidikan"},
        {"id": str(uuid.uuid4()), "name": "Ruqayyah Cantika", "position": "Anggota", "division": "Divisi Dakwah"},
        {"id": str(uuid.uuid4()), "name": "Hamzah Pratama", "position": "Anggota", "division": "Divisi Sosial"},
        {"id": str(uuid.uuid4()), "name": "Safiyyah Maharani", "position": "Anggota", "division": "Divisi Media"},
        {"id": str(uuid.uuid4()), "name": "Ja'far Sidiq", "position": "Anggota", "division": "Divisi Pendidikan"},
        {"id": str(uuid.uuid4()), "name": "Ummu Kultsum", "position": "Anggota", "division": "Divisi Dakwah"},
        {"id": str(uuid.uuid4()), "name": "Abbas Firmansyah", "position": "Anggota", "division": "Divisi Sosial"},
        {"id": str(uuid.uuid4()), "name": "Asma Wulandari", "position": "Anggota", "division": "Divisi Media"},
        {"id": str(uuid.uuid4()), "name": "Muadz Hidayat", "position": "Anggota", "division": "Divisi Pendidikan"},
    ]
    
    # Clear and seed members
    await db.members.delete_many({})
    await db.members.insert_many(sample_members)
    
    # Seed page content
    home_page = {
        "id": str(uuid.uuid4()),
        "pageId": "home",
        "heroTitle": "Geunaseh Jeumala",
        "heroSubtitle": "Bersama Membangun Generasi Berilmu dan Berakhlak",
        "heroDescription": "Organisasi mahasiswa yang berdedikasi untuk pengembangan pendidikan, dakwah, dan sosial kemasyarakatan.",
        "heroImage": "https://customer-assets.emergentagent.com/job_13832b27-906b-4dfc-9ff8-e595f672e269/artifacts/xienulzh_logo.png",
        "sections": [
            {
                "id": "features",
                "title": "Program Unggulan",
                "items": [
                    {"title": "Kajian Rutin", "description": "Kajian mingguan untuk pendalaman ilmu agama dan pengembangan diri"},
                    {"title": "Bakti Sosial", "description": "Kegiatan sosial untuk membantu masyarakat sekitar"},
                    {"title": "Pelatihan", "description": "Workshop dan pelatihan untuk meningkatkan soft skill"},
                    {"title": "Event Tahunan", "description": "Acara besar tahunan yang melibatkan seluruh anggota"}
                ]
            }
        ],
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }
    
    about_page = {
        "id": str(uuid.uuid4()),
        "pageId": "about",
        "heroTitle": "Tentang Kami",
        "heroSubtitle": "Mengenal Lebih Dekat Geunaseh Jeumala",
        "heroDescription": "Geunaseh Jeumala adalah organisasi mahasiswa yang didirikan dengan visi untuk membentuk generasi muda yang berilmu, berakhlak mulia, dan bermanfaat bagi masyarakat.",
        "heroImage": "",
        "sections": [
            {
                "id": "vision",
                "title": "Visi",
                "content": "Menjadi organisasi mahasiswa terdepan dalam pembentukan generasi muda yang berilmu, berakhlak mulia, dan berkontribusi positif bagi bangsa dan agama."
            },
            {
                "id": "mission",
                "title": "Misi",
                "items": [
                    "Menyelenggarakan kajian dan pendidikan untuk peningkatan ilmu agama dan pengetahuan umum",
                    "Mengembangkan potensi dan bakat anggota melalui berbagai kegiatan kreatif",
                    "Membangun solidaritas dan ukhuwah islamiyah antar anggota",
                    "Melaksanakan kegiatan sosial yang bermanfaat bagi masyarakat",
                    "Menjalin kerjasama dengan berbagai pihak untuk pengembangan organisasi"
                ]
            }
        ],
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }
    
    philosophy_page = {
        "id": str(uuid.uuid4()),
        "pageId": "philosophy",
        "heroTitle": "Filosofi",
        "heroSubtitle": "Landasan Pemikiran Geunaseh Jeumala",
        "heroDescription": "Geunaseh Jeumala berasal dari bahasa Aceh yang bermakna 'Kasih Sayang Langit'. Nama ini mencerminkan nilai-nilai kasih sayang, ketulusan, dan keberkahan yang menjadi landasan setiap kegiatan organisasi.",
        "heroImage": "",
        "sections": [
            {
                "id": "meaning",
                "title": "Makna Nama",
                "content": "'Geunaseh' berarti kasih sayang, sedangkan 'Jeumala' berarti langit atau sesuatu yang tinggi dan mulia. Gabungan keduanya melambangkan aspirasi kami untuk menyebarkan kasih sayang yang suci dan mulia."
            },
            {
                "id": "values",
                "title": "Nilai-Nilai Inti",
                "items": [
                    {"title": "Ilmu", "description": "Menuntut ilmu adalah kewajiban, dan kami berkomitmen untuk terus belajar dan mengajarkan"},
                    {"title": "Akhlak", "description": "Akhlak mulia adalah cerminan iman yang benar"},
                    {"title": "Ukhuwah", "description": "Persaudaraan sejati yang dibangun atas dasar iman"},
                    {"title": "Amanah", "description": "Bertanggung jawab dalam setiap tugas yang dipercayakan"}
                ]
            }
        ],
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }
    
    await db.pages.delete_many({})
    await db.pages.insert_many([home_page, about_page, philosophy_page])
    
    # Seed articles
    sample_articles = [
        {
            "id": str(uuid.uuid4()),
            "title": "Kajian Bulanan: Meningkatkan Kualitas Ibadah",
            "slug": "kajian-bulanan-meningkatkan-kualitas-ibadah",
            "summary": "Kajian bulanan kali ini membahas tentang cara meningkatkan kualitas ibadah dalam kehidupan sehari-hari.",
            "content": "<p>Dalam kajian bulanan ini, kami membahas tentang pentingnya meningkatkan kualitas ibadah. Ibadah bukan hanya sekedar ritual, tetapi juga harus membawa perubahan positif dalam kehidupan sehari-hari.</p><p>Beberapa tips yang disampaikan antara lain: menjaga kekhusyukan dalam shalat, memperbanyak dzikir, dan meningkatkan amal sosial.</p>",
            "coverImage": "https://images.unsplash.com/photo-1585036156171-384164a8c675?w=800",
            "tags": ["kajian", "ibadah", "spiritual"],
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Bakti Sosial di Desa Terpencil",
            "slug": "bakti-sosial-desa-terpencil",
            "summary": "Kegiatan bakti sosial yang dilakukan di desa terpencil untuk membantu masyarakat kurang mampu.",
            "content": "<p>Alhamdulillah, tim Geunaseh Jeumala telah melaksanakan kegiatan bakti sosial di desa terpencil. Kegiatan ini meliputi pembagian sembako, pengobatan gratis, dan kegiatan edukasi untuk anak-anak.</p>",
            "coverImage": "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800",
            "tags": ["sosial", "bakti", "komunitas"],
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.articles.delete_many({})
    await db.articles.insert_many(sample_articles)
    
    # Seed events
    sample_events = [
        {
            "id": str(uuid.uuid4()),
            "title": "Seminar Kepemimpinan Islam",
            "slug": "seminar-kepemimpinan-islam",
            "date": "2025-07-15",
            "time": "09:00 - 15:00 WIB",
            "location": "Aula Kampus Utama",
            "description": "Seminar tentang kepemimpinan dalam perspektif Islam dengan pembicara para ulama dan praktisi.",
            "bannerImage": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
            "capacity": 200,
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Workshop Public Speaking",
            "slug": "workshop-public-speaking",
            "date": "2025-07-22",
            "time": "13:00 - 17:00 WIB",
            "location": "Ruang Serbaguna Lt. 3",
            "description": "Pelatihan public speaking untuk meningkatkan kemampuan komunikasi dan presentasi.",
            "bannerImage": "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800",
            "capacity": 50,
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.events.delete_many({})
    await db.events.insert_many(sample_events)
    
    # Seed documents
    sample_docs = [
        {
            "id": str(uuid.uuid4()),
            "title": "Panduan Anggota Baru",
            "slug": "panduan-anggota-baru",
            "description": "Dokumen panduan untuk anggota baru Geunaseh Jeumala",
            "content": "<p>Selamat datang di Geunaseh Jeumala! Dokumen ini berisi panduan lengkap untuk anggota baru.</p>",
            "attachments": [],
            "docType": "documentation",
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Laporan Kegiatan Semester Ganjil 2024",
            "slug": "laporan-kegiatan-semester-ganjil-2024",
            "description": "Laporan lengkap kegiatan organisasi selama semester ganjil 2024",
            "content": "<p>Laporan ini berisi rangkuman seluruh kegiatan yang telah dilaksanakan.</p>",
            "attachments": [],
            "docType": "report",
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Kegiatan Ramadhan 1446 H",
            "slug": "kegiatan-ramadhan-1446h",
            "description": "Rangkaian kegiatan selama bulan Ramadhan",
            "content": "<p>Berbagai kegiatan yang dilaksanakan selama bulan suci Ramadhan.</p>",
            "attachments": [],
            "docType": "activity",
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.documents.delete_many({})
    await db.documents.insert_many(sample_docs)
    
    # Seed media
    sample_media = [
        {
            "id": str(uuid.uuid4()),
            "title": "Foto Kegiatan Baksos",
            "type": "image",
            "url": "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800",
            "description": "Dokumentasi kegiatan bakti sosial",
            "createdAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Foto Kajian Rutin",
            "type": "image",
            "url": "https://images.unsplash.com/photo-1585036156171-384164a8c675?w=800",
            "description": "Suasana kajian rutin mingguan",
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.media.delete_many({})
    await db.media.insert_many(sample_media)
    
    return {"success": True, "message": "Data berhasil di-seed"}

# ==================== ROOT ====================

@api_router.get("/")
async def root():
    return {"message": "Geunaseh Jeumala API", "version": "1.0.0"}

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
