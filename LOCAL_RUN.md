# Local Run Guide (One Command At A Time)

## 1. Prerequisites
Install Docker Desktop and make sure it is running.

## 2. Clone (if not already)
```bash
git clone https://github.com/NikhilKartha5/idea-simulation.git
cd idea-simulation
```

## 3. Environment File
If `.env.example` exists, copy it:
```bash
cp .env.example .env || echo "No example env, skipping"
```
(If file missing, defaults in code are used.)

## 4. Build & Start All Services
```bash
docker compose up --build
```
This builds images (gateway, services, frontend) and starts databases & queues.

Wait until you see lines like:
- `gateway listening` (or similar)
- Postgres accepting connections

## 5. Open URLs
- Frontend: http://localhost:5173
- Gateway health: http://localhost:8080/health
- RabbitMQ UI: http://localhost:15672 (guest/guest)

## 6. Basic API Flow (use any REST client or curl)
Register:
```bash
curl -X POST http://localhost:8080/api/auth/register -H "Content-Type: application/json" -d '{"email":"a@b.com","password":"pass123"}'
```
Login (get token):
```bash
curl -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d '{"email":"a@b.com","password":"pass123"}'
```
Create idea (replace TOKEN):
```bash
curl -X POST http://localhost:8080/api/ideas -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"title":"First Idea","description":"Test"}'
```
Search ideas:
```bash
curl "http://localhost:8080/api/ideas/search?q=First"
```
Vote:
```bash
curl -X POST http://localhost:8080/api/votes -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"idea_id":1,"direction":1}'
```
Comment:
```bash
curl -X POST http://localhost:8080/api/comments -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"idea_id":1,"content":"Nice!"}'
```
Top ideas:
```bash
curl http://localhost:8080/api/ideas/top
```

## 7. Stop Stack
In the same terminal press Ctrl+C, then:
```bash
docker compose down
```

## 8. Clean Rebuild (if stuck)
```bash
docker compose down -v
docker compose build --no-cache
docker compose up
```

## 9. Housekeeping
Remove dangling images:
```bash
docker system prune -f
```

## 10. Troubleshooting Quick Table
| Symptom | Fix |
|---------|-----|
| Port 8080 busy | Stop other process or change left side of mapping in compose |
| DB init fails | Delete volume: `docker volume rm idea-simulation_db_data` (after down) |
| Auth errors | Ensure you used the issued JWT token with `Bearer` prefix |
| Search empty | Ensure idea created & service logs show indexing |

## 11. Run Subset (backend only without frontend)
```bash
docker compose up --build gateway auth-service idea-service vote-service comment-service db redis rabbitmq
```

## 12. Logs For One Service
```bash
docker compose logs -f gateway
```

## 13. Execute Command In Container (example: idea-service)
```bash
docker compose exec idea-service sh
```

---
Generated helper file for easy local running.
