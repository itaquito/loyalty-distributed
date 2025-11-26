## Kubernetes Deployment

### Step 1: Create Kind Cluster

Create a new Kubernetes cluster using Kind:

```bash
kind create cluster --name loyalty-cluster
```

Verify the cluster is running:

```bash
kubectl cluster-info --context kind-loyalty-cluster
```

### Step 2: Build Docker Images

```bash
# Build from root context, specifying Dockerfile location
docker build -t loyalty-business:latest -f business/Dockerfile .
docker build -t loyalty-customer:latest -f customer/Dockerfile .
docker build -t loyalty-transaction:latest -f transaction/Dockerfile .
docker build -t loyalty-frontend:latest -f frontend/Dockerfile .
```

### Step 3: Load Images into Kind

Load the built images into the Kind cluster:

```bash
kind load docker-image loyalty-business:latest --name loyalty-cluster
kind load docker-image loyalty-customer:latest --name loyalty-cluster
kind load docker-image loyalty-transaction:latest --name loyalty-cluster
kind load docker-image loyalty-frontend:latest --name loyalty-cluster
```

### Step 4: Apply Kubernetes Configurations

Apply the configurations in the correct order:

#### 4.1: Create Namespace

```bash
kubectl apply -f k8s-configs/namespace.yaml
```

#### 4.2: Create PersistentVolumeClaim

```bash
kubectl apply -f k8s-configs/postgres-pvc.yaml
```

#### 4.3: Deploy PostgreSQL

```bash
kubectl apply -f k8s-configs/postgres-deployment.yaml
kubectl apply -f k8s-configs/postgres-service.yaml
```

Wait for PostgreSQL to be ready:

```bash
kubectl wait --for=condition=ready pod -l app=postgres -n loyalty-services --timeout=120s
```

#### 4.4: Run Database Migrations

Port-forward to PostgreSQL to run migrations:

```bash
# In one terminal, start port-forward
kubectl port-forward -n loyalty-services service/postgres 5432:5432
```

In another terminal, run migrations:

```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://loyalty_user:loyalty_pass@localhost:5432/loyalty"

# Run migrations using npm
npm run db:push
```

After migrations complete, stop the port-forward (Ctrl+C in the first terminal).

#### 4.5: Deploy Microservices

```bash
# Deploy business service
kubectl apply -f k8s-configs/business-deployment.yaml
kubectl apply -f k8s-configs/business-service.yaml

# Deploy customer service
kubectl apply -f k8s-configs/customer-deployment.yaml
kubectl apply -f k8s-configs/customer-service.yaml

# Deploy transaction service
kubectl apply -f k8s-configs/transaction-deployment.yaml
kubectl apply -f k8s-configs/transaction-service.yaml

# Deploy frontend
kubectl apply -f k8s-configs/frontend-deployment.yaml
kubectl apply -f k8s-configs/frontend-service.yaml
```

**Alternative - Apply all at once:**

```bash
kubectl apply -f k8s-configs/
```

### Step 5: Verify Deployment

Check all resources in the namespace:

```bash
kubectl get all -n loyalty-services
```

Check pods status:

```bash
kubectl get pods -n loyalty-services
```

Check services:

```bash
kubectl get svc -n loyalty-services
```

Check PVC:

```bash
kubectl get pvc -n loyalty-services
```

View pod logs if needed:

```bash
# Business service logs
kubectl logs -n loyalty-services -l app=business-service

# Customer service logs
kubectl logs -n loyalty-services -l app=customer-service

# Transaction service logs
kubectl logs -n loyalty-services -l app=transaction-service

# Frontend logs
kubectl logs -n loyalty-services -l app=frontend

# PostgreSQL logs
kubectl logs -n loyalty-services -l app=postgres
```

### Step 6: Access the Services

Port-forward to access the services locally:

```bash
# Frontend (in terminal 1)
kubectl port-forward -n loyalty-services service/frontend --address 0.0.0.0 80:80

# Customer service (in terminal 2)
kubectl port-forward -n loyalty-services service/customer-service --address 0.0.0.0 8080:8080
```

#### Test API Endpoints

```bash
# Create a customer
curl -X POST "http://localhost:8080/customer?id=1" \
  -H "Content-Type: application/json" \
  -d '{"businessID": 1, "name": "John Doe"}'

# Get the customer (includes enriched business data and transactions via gRPC calls)
curl "http://localhost:8080/customer?id=1"
```

## Customer API Documentation

The Customer service exposes a REST API on port 8080. All endpoints use the `/customer` path.

### Endpoints

#### GET /customer

Get all customers or a specific customer by ID.

**Get All Customers:**
```bash
curl "http://localhost:8080/customer"
```

**Response:** Array of customer objects
```json
[
  {
    "id": 1,
    "businessID": 1,
    "name": "John Doe"
  }
]
```

**Get Specific Customer:**
```bash
curl "http://localhost:8080/customer?id=1"
```

**Response:** Customer object enriched with business data and transactions (via gRPC calls to Business and Transaction services)
```json
{
  "id": 1,
  "businessID": 1,
  "name": "John Doe",
  "business": {
    "id": 1,
    "name": "Acme Corp"
  },
  "transactions": [
    {
      "id": 1,
      "customerID": 1,
      "type": "DEPOSIT",
      "quantity": 100
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request` - Invalid customer ID
- `404 Customer Not Found` - Customer does not exist
- `404 Business Not Found` - Associated business does not exist
- `500 Internal Server Error` - Server error

#### POST /customer

Create a new customer.

**Request:**
```bash
curl -X POST "http://localhost:8080/customer?id=1" \
  -H "Content-Type: application/json" \
  -d '{"businessID": 1, "name": "John Doe"}'
```

**Query Parameters:**
- `id` (required) - Customer ID (positive integer)

**Request Body:**
```json
{
  "businessID": 1,
  "name": "John Doe"
}
```

**Response:** `Success!` (200 OK)

**Error Responses:**
- `400 Bad Request` - Invalid request body or missing customer ID
- `404 Business Not Found` - Referenced business does not exist
- `500 Internal Server Error` - Server error

#### PUT /customer

Update an existing customer.

**Request:**
```bash
curl -X PUT "http://localhost:8080/customer?id=1" \
  -H "Content-Type: application/json" \
  -d '{"businessID": 1, "name": "Jane Doe"}'
```

**Query Parameters:**
- `id` (required) - Customer ID (positive integer)

**Request Body:**
```json
{
  "businessID": 1,
  "name": "Jane Doe"
}
```

**Response:** `Success!` (200 OK)

**Error Responses:**
- `400 Bad Request` - Invalid request body or missing customer ID
- `404 Customer Not Found` - Customer does not exist
- `404 Business Not Found` - Referenced business does not exist
- `500 Internal Server Error` - Server error

#### DELETE /customer

Delete a customer.

**Request:**
```bash
curl -X DELETE "http://localhost:8080/customer?id=1"
```

**Query Parameters:**
- `id` (required) - Customer ID (positive integer)

**Response:** `Success!` (200 OK)

**Error Responses:**
- `400 Bad Request` - Invalid or missing customer ID
- `404 Customer Not Found` - Customer does not exist
- `500 Internal Server Error` - Server error

### Notes

- The Customer service validates that the referenced `businessID` exists by making a gRPC call to the Business service during create and update operations
- The GET endpoint for a specific customer enriches the response with business details and associated transactions via gRPC calls to the Business and Transaction services
- All IDs must be positive integers
- Customer names cannot be empty

## Cleanup

### Delete Kubernetes Resources

Delete all resources in the loyalty-services namespace:

```bash
kubectl delete namespace loyalty-services
```

Or delete resources individually:

```bash
# Delete deployments
kubectl delete deployment -n loyalty-services --all

# Delete services
kubectl delete service -n loyalty-services --all

# Delete PVC (this will delete all database data)
kubectl delete pvc -n loyalty-services --all

# Delete namespace
kubectl delete namespace loyalty-services
```

### Delete Kind Cluster

Remove the Kind cluster completely:

```bash
kind delete cluster --name loyalty-cluster
```

Verify cluster is deleted:

```bash
kind get clusters
```

### Clean Up Docker Images (Optional)

Remove the built Docker images:

```bash
docker rmi loyalty-business:latest
docker rmi loyalty-customer:latest
docker rmi loyalty-transaction:latest
```
