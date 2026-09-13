# Hospitality Revenue Intelligence Platform

A full-stack financial analytics application designed to query, aggregate, and visualize enterprise hospitality data from **Snowflake**. Built with a decoupled architecture, containerized via multi-stage **Docker** builds, and orchestrated locally with **Kubernetes**.

---

## Architecture Overview

```text
[ Web Browser ]
       │
       ▼ NodePort: 30080
[ React Frontend Pod (Nginx Alpine) ]
       │
       ▼ REST API (NodePort: 30001 / Container: 5001)
[ Express.js API Gateway Pod ]
       │
       ▼ TLS Query via snowflake-sdk
[ Snowflake Cloud Data Warehouse ]
   └── DB: MY_COMPANY_DB
       └── Schema: SAMPLE_DATA
           └── Table: FINANCE
```

* **Frontend:** React 18 (Vite) served through an optimized Nginx Alpine web server. Provides dynamic dropdown filters and interactive financial metrics tables.
* **Backend API:** Node.js/Express service managing connection pooling via `snowflake-sdk`. Sanitizes SQL inputs and abstracts warehouse credentials from client workloads.
* **Data Layer:** Snowflake Data Warehouse storing multi-dimensional records (Room Revenue, Food & Beverage, Events, Total Revenue).
* **Containerization:** Multi-stage Docker builds separating the compilation environments from lightweight production runtimes.
* **Orchestration:** Kubernetes manifests managing Deployments, replica lifecycles, internal service discovery, and base64-encoded Secrets.

---

## Directory Structure

```text
hotel-finance-app/
├── docker-compose.yml              # Local container multi-service orchestration
├── README.md                       # Architecture & deployment documentation
├── .gitignore                      # Security exclusions (.env, secrets, node_modules)
│
├── server/                         # Backend API Service
│   ├── .env                        # Local database credentials (ignored in Git)
│   ├── Dockerfile                  # Node.js Alpine execution container
│   ├── server.js                   # Express server, connection pool & endpoints
│   ├── package.json                # Backend dependencies
│   └── package-lock.json
│
├── client/                         # Frontend React Dashboard
│   ├── Dockerfile                  # Multi-stage build (Node builder -> Nginx runtime)
│   ├── index.html                  # Single-page application entry point
│   ├── vite.config.js              # Bundler configuration
│   ├── package.json                # UI dependencies
│   └── src/
│       ├── main.jsx                # DOM mounting entry point
│       ├── App.jsx                 # Dashboard views, dropdown hooks & data table
│       └── App.css                 # Custom styling
│
└── k8s/                            # Kubernetes Cluster Manifests
    ├── snowflake-secret.yaml.example # Sanitized template for cluster credentials
    ├── backend.yaml                # API Deployment & NodePort Service (30001)
    └── frontend.yaml               # React UI Deployment & NodePort Service (30080)
```

---

## Quickstart Guide

### 1. Configure Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=5001
SNOWFLAKE_ACCOUNT=your-account-locator
SNOWFLAKE_USERNAME=your-username
SNOWFLAKE_PASSWORD=your-password
SNOWFLAKE_DATABASE=MY_COMPANY_DB
SNOWFLAKE_SCHEMA=SAMPLE_DATA
SNOWFLAKE_WAREHOUSE=COMPUTE_WH
```

---

### 2. Local Development (Native Node)

Run the backend API:

```bash
cd server
npm install
node server.js
```

Run the frontend dashboard in a separate terminal:

```bash
cd client
npm install
npm run dev
```

* Frontend: `http://localhost:5173`
* Backend API: `http://localhost:5001/api/filters`

---

### 3. Run with Docker Compose

Spin up both services containerized in a shared bridge network:

```bash
# Build and start containers in the background
docker compose up --build -d

# Check running container status
docker compose ps

# Tail live application logs
docker compose logs -f

# Shut down and remove containers
docker compose down
```

* Frontend: `http://localhost:3000`
* Backend API: `http://localhost:5001/api/financials`

---

### 4. Deploy to Kubernetes (Docker Desktop / Kind / Minikube)

**Build Container Images Locally:**

```bash
docker build -t hotel-backend:v1 ./server
docker build -t hotel-frontend:v1 ./client
```

**Set Up Cluster Secrets:**

Copy the template and replace the placeholders with your Snowflake credentials:

```bash
cp k8s/snowflake-secret.yaml.example k8s/snowflake-secret.yaml
```

**Apply Kubernetes Manifests:**

```bash
kubectl apply -f k8s/snowflake-secret.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
```

**Verify Workload Status:**

```bash
kubectl get pods
kubectl get svc
```

**Access Running Services:**

* **Frontend Dashboard:** `http://localhost:30080`
* **Backend Endpoint:** `http://localhost:30001/api/filters`

**Tear Down Cluster Workloads:**

```bash
kubectl delete -f k8s/frontend.yaml
kubectl delete -f k8s/backend.yaml
kubectl delete -f k8s/snowflake-secret.yaml
```

---

## Key Technical Takeaways

* **Decoupled Security Pattern:** Database credentials remain strictly isolated on the backend server. The client layer consumes sanitized REST endpoints, preventing exposure of warehouse connection strings or credentials to the browser.
* **Multi-Stage Build Optimization:** The React application leverages a multi-stage Docker build. Node compiles static assets in stage 1, and stage 2 copies the minified output into an `nginx:alpine` image, keeping the production footprint under 30MB.
* **Local Cluster Image Resolution:** Addressed `ErrImageNeverPull` runtime errors on local Docker Desktop Kubernetes nodes by configuring `imagePullPolicy: IfNotPresent`, allowing the containerd runtime to resolve locally cached image tags reliably.
