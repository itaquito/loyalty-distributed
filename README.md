## Step 1: Create Kind Cluster

Create a new Kubernetes cluster using Kind:

```bash
kind create cluster --name loyalty-cluster
```

Verify the cluster is running:

```bash
kubectl cluster-info --context kind-loyalty-cluster
```

## Step 2: Build Docker Images

Build Docker images for all three services:

```bash
# Build from root context, specifying Dockerfile location
docker build -t loyalty-business:latest -f business/Dockerfile .
docker build -t loyalty-customer:latest -f customer/Dockerfile .
docker build -t loyalty-transaction:latest -f transaction/Dockerfile .
```

## Step 3: Load Images into Kind

Load the built images into the Kind cluster:

```bash
kind load docker-image loyalty-business:latest --name loyalty-cluster
kind load docker-image loyalty-customer:latest --name loyalty-cluster
kind load docker-image loyalty-transaction:latest --name loyalty-cluster
```

## Step 4: Apply Kubernetes Configurations

Apply the configurations in the correct order:

### 4.1: Create Namespace

```bash
kubectl apply -f k8s-configs/namespace.yaml
```

### 4.2: Create PersistentVolumeClaim

```bash
kubectl apply -f k8s-configs/postgres-pvc.yaml
```

### 4.3: Deploy PostgreSQL

```bash
kubectl apply -f k8s-configs/postgres-deployment.yaml
kubectl apply -f k8s-configs/postgres-service.yaml
```

Wait for PostgreSQL to be ready:

```bash
kubectl wait --for=condition=ready pod -l app=postgres -n loyalty-services --timeout=120s
```

### 4.4: Run Database Migrations

Port-forward to PostgreSQL to run migrations:

```bash
# In one terminal, start port-forward
kubectl port-forward -n loyalty-services service/postgres 5432:5432
```

In another terminal, run migrations:

```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://loyalty_user:loyalty_pass@localhost:5432/loyalty"

# Run migrations
deno task db:push
```

After migrations complete, stop the port-forward (Ctrl+C in the first terminal).

### 4.5: Deploy Microservices

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
```

**Alternative - Apply all at once:**

```bash
kubectl apply -f k8s-configs/
```

## Step 5: Verify Deployment

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

# PostgreSQL logs
kubectl logs -n loyalty-services -l app=postgres
```

## Step 6: Test the Services

Port-forward to access the services locally:

```bash
# Business service (in terminal 1)
kubectl port-forward -n loyalty-services service/business-service 8002:8080

# Customer service (in terminal 2)
kubectl port-forward -n loyalty-services service/customer-service 8000:8080

# Transaction service (in terminal 3)
kubectl port-forward -n loyalty-services service/transaction-service 8001:8080
```

### Test API Endpoints

In a new terminal, test the services:

```bash
# Create a business
curl -X POST "http://localhost:8002/business?id=1" \
  -H "Content-Type: application/json" \
  -d '{"name": "Acme Corp"}'

# Get the business
curl "http://localhost:8002/business?id=1"

# Create a customer
curl -X POST "http://localhost:8000/customer?id=1" \
  -H "Content-Type: application/json" \
  -d '{"businessID": 1, "name": "John Doe"}'

# Get the customer (includes business and transactions)
curl "http://localhost:8000/customer?id=1"

# Create a transaction
curl -X POST "http://localhost:8001/transaction?id=1" \
  -H "Content-Type: application/json" \
  -d '{"customerID": 1, "type": "DEPOSIT", "quantity": 100}'

# Get transactions for customer
curl "http://localhost:8001/transaction?customerID=1"

# Get the customer again (now with transactions)
curl "http://localhost:8000/customer?id=1"
```

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
