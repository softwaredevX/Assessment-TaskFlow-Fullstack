# Task Flow - Project Management API

Task Flow is a production-grade project management tool built with FastAPI and React. It features an efficient ordering system, soft-delete cascading, and performance optimizations to handle complex board interactions.

## Technical Requirements & Design

### 1. Efficient Ordering (LexoRank)
Instead of using integer-based ordering (which requires updating multiple rows on every move), we implement **LexoRank**. 
- **How it works**: Every card has a `rank` string. When a card is moved between Card A and Card B, we calculate a new string that is lexicographically between them (e.g., between "aaaa" and "cccc" is "bbbb").
- **Benefit**: Moving a card is an **O(1)** operation—only the moved card's row is updated.

### 2. Soft Deletes & Cascading
To maintain data integrity and audit trails, entities are never permanently deleted from the database.
- **Behavior**: All models inherit from a `TimestampedModel` which includes a `deleted_at` field.
- **Cascading**: When a Board is soft-deleted, the `BoardService` recursively marks all associated Lists and Cards as deleted in a single transaction.
- **API Filtering**: All `GET` endpoints automatically filter out entities where `deleted_at` is not null.

### 3. N+1 Performance Optimization
Large boards with many lists and cards can cause "N+1 Query" performance issues if handled poorly.
- **Solution**: The `GET /api/v1/boards/{id}` endpoint uses SQLAlchemy's **`selectinload`** strategy.
- **Result**: The entire hierarchy (Board -> Lists -> Cards) is fetched in exactly **3 optimized queries**, regardless of how many items exist.

### 4. Concurrency & Race Conditions
When multiple users move the same card or change positions simultaneously:
- **Locking**: We use PostgreSQL's **`FOR UPDATE`** row-level locking during the `move_card` operation.
- **Transactions**: The entire rank calculation and update happen within an `async with db.begin_nested()` block to ensure atomicity.

### 5. Authentication
- **Production**: Secure JWT-based authentication via Argon2 password hashing.
- **Development**: A special `mock-token` is supported for rapid frontend development (bypasses JWT validation and uses the first available user).

## 🛠 Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, dnd-kit
- **Backend**: Python 3.11, FastAPI, SQLModel (SQLAlchemy)
- **Database**: PostgreSQL 16
- **Package Management**: `uv` (Fastest Python package manager)
- **Migration Engine**: Alembic
- **Infrastructure**: Docker & Docker Compose

---

## 🚦 Getting Started

### Prerequisites
Ensure you have the following installed:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Installation & Startup
Follow these steps to get the project running locally:

**1. Clone the repository and navigate to the project root.**

**2. Start the services with Docker Compose:**
```bash
docker compose up --build -d
```

**3. Run Database Migrations:**
Once the containers are up and the database is ready, apply the migrations:
```bash
docker compose exec backend uv run alembic upgrade head
```
> [!NOTE]
> Database migrations are **idempotent**. This means they can be safely run multiple times without causing errors, even if some tables or indexes already exist.
---

## 📖 Application & API Access

Once the containers are running:
- **Web Application (Frontend)**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8000](http://localhost:8000)

You can explore and test the backend endpoints directly using the standard FastAPI interfaces:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

##  Project Structure
- `/frontend`: React frontend application built with Vite, TypeScript, and Tailwind CSS.
- `/backend`: Core API implementation, SQL models, business services, and database migrations.
- `docker-compose.yml`: Full-stack orchestration for local development and staging.
