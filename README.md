# Hospitality Revenue Intelligence Platform

A full-stack analytics application querying enterprise data from **Snowflake**, containerized with **Docker**, and orchestrated on **Kubernetes**.

---

## Architecture

* **Frontend:** React 18 (Vite) served via Nginx Alpine (NodePort `30080`).
* **Backend:** Node.js/Express API with connection pooling via `snowflake-sdk` (NodePort `30001`).
* **Database:** Snowflake Cloud Data Warehouse (`FINANCE` schema).
* **Orchestration:** Multi-stage Docker builds deployed via Kubernetes Deployments, Secrets, and Services.

---

## Quickstart

1. Setup Environment
Add Snowflake credentials to `server/.env`:

env
PORT=5001
SNOWFLAKE_ACCOUNT=your-account
SNOWFLAKE_USERNAME=your-username
SNOWFLAKE_PASSWORD=your-password
SNOWFLAKE_DATABASE=MY_COMPANY_DB
SNOWFLAKE_SCHEMA=SAMPLE_DATA
SNOWFLAKE_WAREHOUSE=COMPUTE_WH

2. Run Locally
Backend: cd server && npm install && node server.js (:5001)
Frontend: cd client && npm install && npm run dev (:5173)

3. Run via Docker Compose
docker compose up --build -d
Access UI at http://localhost:3000 and API at http://localhost:5001/api/filters

4. Deploy to Kubernetes
# Build images
docker build -t hotel-backend:v1 ./server
docker build -t hotel-frontend:v1 ./client
# Apply secrets and manifests
kubectl apply -f k8s/snowflake-secret.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml

Key Learnings
Decoupled Security: Backend abstracts Snowflake credentials from the client app.
Image Optimization: Multi-stage React Dockerfile yields a minimal <30MB Nginx runtime.
Local Cluster Resolution: Used imagePullPolicy: IfNotPresent to eliminate ErrImageNeverPull issues on local containerd runtimes.


