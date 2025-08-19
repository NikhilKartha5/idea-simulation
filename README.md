# Idea Simulation Platform

Microservices web application for creating, searching, voting on, and commenting on ideas. Shows distributed service design, messaging, caching, CI/CD and Terraform infrastructure.

## Architecture
- Frontend: React + TypeScript (Vite)
- API Gateway: Node.js / Express (routing, auth, security headers)
- Services:
  - Auth Service (JWT issuance)
  - Idea Service (CRUD + search)
  - Vote Service (vote tally & ranking)
  - Comment Service (threaded comments)
- Event Bus: RabbitMQ (idea.created, vote.cast, comment.created)
- Data Stores: PostgreSQL (primary), Redis (cache / rankings)
- Containerization: Docker (local compose), images in ECR
- Infrastructure: Terraform (VPC, subnets, SGs, ALB, Auto Scaling Group, EC2, IAM). Local demo uses in‑instance Postgres/Redis/RabbitMQ; production would use managed services (RDS, ElastiCache, Amazon MQ).
- CI/CD: Jenkins pipeline (lint, test, build, push, infra apply placeholder)

## Local Development
```bash
cp .env.example .env
docker compose up --build
# Frontend: http://localhost:5173
# Gateway:  http://localhost:8080/health
```

### Basic API Flow
1. Register -> /api/auth/register
2. Login -> /api/auth/login (get JWT)
3. Create idea -> /api/ideas
4. Vote -> /api/votes
5. Comment -> /api/comments
6. Search -> /api/ideas/search?q=term
7. Top ideas -> /api/ideas/top

## Deployment (Current State)
Deployed on AWS EC2 inside an Auto Scaling Group behind an Application Load Balancer. User data (and/or manual steps) pull images from ECR and run containers. Root volume enlarged to 30GB to fit images. Health check: `GET /health` on gateway (port 8080) returns 200 through ALB.

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

## Educational Purpose
This repository is an educational simulation; not production hardened. Use as a learning scaffold.
