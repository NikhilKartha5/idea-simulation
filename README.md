# Idea Simulation Platform

Microservices web application for creating, searching, voting on, and commenting on ideas. Demonstrates distributed service design, messaging, caching, CI/CD and Terraform infrastructure. Now includes a minimal frontend authentication flow (register / login / logout) and selective endpoint protection.

## Architecture
- Frontend: React (Vite) – lightweight hash router & custom Auth context (localStorage JWT)
- API Gateway: Node.js / Express (routing, auth, security headers)
- Services:
  - Auth Service (JWT issuance)
  - Idea Service (CRUD + search)
  - Vote Service (vote tally & ranking)
  - Comment Service (threaded comments)
- Event Bus: RabbitMQ (idea.created, vote.cast, comment.created)
- Data Stores: PostgreSQL (primary), Redis (cache / rankings)
- Containerization: Docker (local compose), images in ECR
- Infrastructure: Terraform (VPC, subnets, SGs, ALB, Auto Scaling Group, EC2, IAM). Local demo uses in‑instance Postgres/Redis/RabbitMQ; a production variant would instead use managed services (RDS, ElastiCache, Amazon MQ).
- CI/CD: Jenkins pipeline (lint, test, build, push, infra apply placeholder)
## Local Development
```bash
cp .env.example .env
docker compose up --build
# Frontend: http://localhost:5173
# Gateway health:  http://localhost:8080/health
```

Hot reload for the frontend occurs automatically via Vite. For backend/gateway/service code changes you may need to rebuild that specific image:
```bash
docker compose build gateway && docker compose up -d gateway
```

### Auth Model (Current)
Frontend exposes Register & Login screens. Successful login stores JWT + email in `localStorage` and automatically adds a `Bearer` token to subsequent mutating requests.

Protected (JWT required):
- POST /api/ideas
- POST /api/votes
- POST /api/comments

Public (no JWT required):
- GET /api/ideas
- GET /api/ideas/top
- GET /api/ideas/search?q=term
- GET /api/comments/:idea_id

The vote POST endpoint also derives a deterministic anonymous UUID fallback from the request IP, but when authenticated it prefers the JWT subject (`sub`).

### Basic Usage Flow (UI)
1. Open frontend at http://localhost:5173
2. Register a user (email + password)
3. Login → navbar updates with email + Sign Out button
4. Navigate to Ideas → create new ideas (requires auth)
5. View Top Ideas / Search without needing auth (read-only)
6. Sign Out returns you to the Home screen (public landing)

### Basic API Flow (Raw)
1. Create idea -> POST /api/ideas (JWT)
2. Vote -> POST /api/votes (JWT)
3. Comment -> POST /api/comments (JWT)
4. Search -> GET /api/ideas/search?q=term
5. Top ideas -> GET /api/ideas/top

## Deployment (Current State)
Deployed (simulation) on AWS EC2 inside an Auto Scaling Group behind an Application Load Balancer. User data (and/or manual steps) pull images from ECR and run containers. Root volume enlarged to 30GB to fit images. Health check: `GET /health` on gateway (port 8080) returns 200 through ALB.

### Future Hardening
- Move Postgres/Redis/RabbitMQ to managed services (RDS / ElastiCache / Amazon MQ)
- Store secrets (JWT_SECRET, DB creds) in SSM Parameter Store / Secrets Manager
- CloudWatch log shipping (or OpenTelemetry collector)
- Add metrics & traces
- Automated zero-downtime rolling refresh (instance refresh or blue/green)
- Multi-stage Docker builds with smaller runtime images

## Roadmap
- Add integration tests & smoke tests in pipeline
- Implement event consumers & projections
- Realtime updates (WebSocket / SSE)
- Security scanning (Trivy, Syft) + SBOM
- Observability stack
- Auto-login immediately after registration (issue JWT on register response)
- Replace hash router with React Router & proper 404 handling
- Associate vote/comment user IDs strictly with JWT subject (remove anonymous fallback)
- Improved error boundary & toast notifications

## Educational Purpose
This repository is an educational simulation; not production hardened. Use as a learning scaffold.
