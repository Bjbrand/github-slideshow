import asyncio
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import bcrypt
import uuid
from datetime import datetime, timezone
from pathlib import Path

# Load environment variables
env_path = Path(__file__).parent.parent / 'backend' / '.env'
load_dotenv(env_path)

async def create_admin():
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Check if admin exists
    existing_admin = await db.users.find_one({"email": "admin@sonic.com"})
    if existing_admin:
        print("Admin user already exists!")
        return
    
    # Create admin user
    admin_password = "admin123"
    hashed_password = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    admin_doc = {
        "id": str(uuid.uuid4()),
        "name": "Admin User",
        "email": "admin@sonic.com",
        "password": hashed_password,
        "role": "admin",
        "phone": None,
        "company_name": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(admin_doc)
    print("Admin user created successfully!")
    print("Email: admin@sonic.com")
    print("Password: admin123")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_admin())
