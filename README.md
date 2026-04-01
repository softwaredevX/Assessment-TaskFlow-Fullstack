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
- **Backend**: Python 3.11, FastAPI, SQLModel (SQLAlchemy), Alembic, Pydantic V2.
- **Package Manager**: `uv` (Fast, reliable Python package management).
- **Database**: PostgreSQL 16.
- **Infrastructure**: Docker & Docker Compose.

##  API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Create a new user.
- `POST /api/v1/auth/login` - Obtain a JWT access token.

### Boards
- `GET /api/v1/boards` - List all boards for the current user.
- `POST /api/v1/boards` - Create a new board.
- `GET /api/v1/boards/{id}` - Get a detailed board view (includes lists and cards).
- `DELETE /api/v1/boards/{id}` - Soft-delete a board and its contents.

### Lists
- `POST /api/v1/boards/{id}/lists` - Create a new list in a specific board.
- `DELETE /api/v1/lists/{id}` - Soft-delete a list (cascades to cards).

### Cards
- `POST /api/v1/cards` - Create a new card in a list.
- `PATCH /api/v1/cards/{id}` - Update card title or description.
- `DELETE /api/v1/cards/{id}` - Soft-delete a card.
- `PATCH /api/v1/cards/{id}/move` - Move a card between lists or reorder it.

## Running the Project
```bash
docker compose up --build
```
The API will be available at `http://localhost:8000`.
Swagger Documentation: `http://localhost:8000/docs`

##  Project Structure
- `/backend`: FastAPI application, models, services, and migrations.
- `/frontend`: React application
- `docker-compose.yml`: Full stack orchestration.
