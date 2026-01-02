from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI(title="Geunaseh Jeumala Backend", version="1.0.0")

# CORS
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==== AUTH ====

class LoginRequest(BaseModel):
    username: str
    password: str
    secret_code: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"
ADMIN_SECRET = "<Mavecode300107>"


@app.post("/api/auth/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    if (
        payload.username != ADMIN_USERNAME
        or payload.password != ADMIN_PASSWORD
        or payload.secret_code != ADMIN_SECRET
    ):
        raise HTTPException(status_code=401, detail="Invalid credentials or secret code")

    return TokenResponse(access_token="dummy-token")


# ==== GENERIC ENTITY MODELS (IN-MEMORY, DEMO) ====

class BaseEntity(BaseModel):
    id: int
    title: Optional[str] = None
    name: Optional[str] = None
    slug: Optional[str] = None


class CreateEntity(BaseModel):
    title: Optional[str] = None
    name: Optional[str] = None
    slug: Optional[str] = None


db = {
    "pages": [],
    "articles": [],
    "events": [],
    "members": [],
    "documents": [],
    "media": [],
    "tasks": [],
}


def get_store(resource: str) -> List[BaseEntity]:
    if resource not in db:
        raise HTTPException(status_code=404, detail="Resource not found")
    return db[resource]


@app.get("/api/{resource}", response_model=List[BaseEntity])
async def list_resource(resource: str):
    return get_store(resource)


@app.post("/api/{resource}", response_model=BaseEntity)
async def create_resource(resource: str, payload: CreateEntity):
    store = get_store(resource)
    new_id = (store[-1].id + 1) if store else 1
    entity = BaseEntity(
        id=new_id,
        title=payload.title,
        name=payload.name,
        slug=payload.slug,
    )
    store.append(entity)
    return entity


@app.put("/api/{resource}/{item_id}", response_model=BaseEntity)
async def update_resource(resource: str, item_id: int, payload: CreateEntity):
    store = get_store(resource)
    for idx, item in enumerate(store):
        if item.id == item_id:
            updated = item.copy(update=payload.dict(exclude_unset=True))
            store[idx] = updated
            return updated
    raise HTTPException(status_code=404, detail="Item not found")


@app.delete("/api/{resource}/{item_id}")
async def delete_resource(resource: str, item_id: int):
    store = get_store(resource)
    for idx, item in enumerate(store):
        if item.id == item_id:
            store.pop(idx)
            return {"ok": True}
    raise HTTPException(status_code=404, detail="Item not found")


@app.get("/api/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8001, reload=True)
