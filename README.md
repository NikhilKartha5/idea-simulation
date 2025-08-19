# AHA Ideas Simulation

A 3-tier microservices web application for creating, discovering, voting on, and commenting on innovative ideas.

## Architecture
- Frontend: React + TypeScript (Vite) SPA
- API Gateway: Node.js Express (aggregates and routes to services)
- Services (independent containers + REST + internal events):
  - Idea Service: CRUD ideas, search, tagging
  - Vote Service: Up/down votes, ranking
  - Comment Service: Threaded comments
- Data Stores:
  - PostgreSQL (ideas, comments, votes)
  - Redis (caching hot ideas, rate limiting)
- Messaging / Async Events: RabbitMQ (idea_created, vote_cast, comment_added)
- CI/CD: Jenkins pipeline building, testing, containerizing, and deploying to AWS EC2 behind an Application Load Balancer with auto scaling groups.
- Containerization: Docker & docker-compose for local dev.
- Infrastructure as Code: Terraform (VPC, subnets, security groups, ALB, ASGs, RDS, ElastiCache, EC2, IAM roles, SSM parameters)

## Local Development Quick Start
```
# 1. Copy sample envs
cp .env.example .env
# 2. Start all services
docker compose up --build
# 3. Open frontend at http://localhost:5173
```

## High-Level Data Flow
1. User creates idea (Frontend -> Gateway -> Idea Service -> PostgreSQL -> event -> queue)
2. Other services consume events for denormalized projections / cache invalidation.
3. Votes & comments follow similar path; rankings served from Redis for speed.

## Jenkins Pipeline Stages
1. Checkout
2. Install & Cache dependencies
3. Lint & Test (services + frontend)
4. Build Docker images
5. Security scan (Trivy)
6. Push images to ECR
7. Terraform plan & apply (separate approval for prod)
8. Rolling deploy to ASG / ECS (future option)
9. Post-deploy smoke tests

## Next Steps
- Fill service implementations
- Add unit/integration tests
- Implement search (pg_trgm / full-text)
- Add WebSocket/Server-Sent Events for live updates

---
This repository is an educational simulation designed to showcase full-stack microservices proficiency.
