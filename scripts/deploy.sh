#!/bin/bash
# ============================================
# Church App Deployment Script
# ============================================
# Usage: ./scripts/deploy.sh [staging|production]
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default environment
ENVIRONMENT="${1:-staging}"

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo -e "${RED}Error: Invalid environment. Use 'staging' or 'production'${NC}"
    exit 1
fi

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   Church App Deployment - ${ENVIRONMENT^^}${NC}"
echo -e "${BLUE}============================================${NC}"

# Check required files
ENV_FILE=".env.${ENVIRONMENT}"
if [[ ! -f "$ENV_FILE" ]]; then
    echo -e "${RED}Error: Environment file '$ENV_FILE' not found${NC}"
    echo -e "${YELLOW}Please create it from .env.production.example${NC}"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' "$ENV_FILE" | xargs)

# Validate required variables
REQUIRED_VARS=(
    "JWT_SECRET"
    "DB_PASSWORD"
    "REDIS_PASSWORD"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [[ -z "${!var}" ]]; then
        echo -e "${RED}Error: Required variable '$var' is not set in $ENV_FILE${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✓ Environment validated${NC}"

# Select docker-compose file
if [[ "$ENVIRONMENT" == "staging" ]]; then
    COMPOSE_FILE="docker-compose.staging.yml"
else
    COMPOSE_FILE="docker-compose.yml"
fi

echo -e "${BLUE}Using compose file: $COMPOSE_FILE${NC}"

# Pre-deployment checks
echo -e "\n${YELLOW}Running pre-deployment checks...${NC}"

# Check Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"

# Check disk space (require at least 2GB free)
AVAILABLE_SPACE=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
if [[ "$AVAILABLE_SPACE" -lt 2 ]]; then
    echo -e "${RED}Warning: Low disk space (${AVAILABLE_SPACE}GB available)${NC}"
fi
echo -e "${GREEN}✓ Disk space check passed (${AVAILABLE_SPACE}GB available)${NC}"

# Pull latest images
echo -e "\n${BLUE}Pulling latest images...${NC}"
docker compose -f "$COMPOSE_FILE" pull

# Create backup before deployment (production only)
if [[ "$ENVIRONMENT" == "production" ]]; then
    echo -e "\n${YELLOW}Creating pre-deployment backup...${NC}"
    ./scripts/backup-database.sh "pre-deploy-$(date +%Y%m%d-%H%M%S)" || true
    echo -e "${GREEN}✓ Backup created${NC}"
fi

# Stop existing containers gracefully
echo -e "\n${BLUE}Stopping existing containers...${NC}"
docker compose -f "$COMPOSE_FILE" down --timeout 30

# Start new containers
echo -e "\n${BLUE}Starting containers...${NC}"
docker compose -f "$COMPOSE_FILE" up -d

# Wait for services to be healthy
echo -e "\n${YELLOW}Waiting for services to be healthy...${NC}"
sleep 10

# Health check
MAX_RETRIES=30
RETRY_COUNT=0
BACKEND_URL="http://localhost:3000"
[[ "$ENVIRONMENT" == "staging" ]] && BACKEND_URL="http://localhost:3001"

while [[ $RETRY_COUNT -lt $MAX_RETRIES ]]; do
    if curl -s "$BACKEND_URL/health" | grep -q "healthy"; then
        echo -e "${GREEN}✓ Backend is healthy${NC}"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "Waiting for backend... (attempt $RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

if [[ $RETRY_COUNT -eq $MAX_RETRIES ]]; then
    echo -e "${RED}Error: Backend failed to start${NC}"
    echo -e "${YELLOW}Checking logs...${NC}"
    docker compose -f "$COMPOSE_FILE" logs backend --tail=50
    exit 1
fi

# Run database migrations
echo -e "\n${BLUE}Running database migrations...${NC}"
docker compose -f "$COMPOSE_FILE" exec -T backend npx prisma migrate deploy

# Clean up old images
echo -e "\n${YELLOW}Cleaning up old images...${NC}"
docker image prune -f

# Final status
echo -e "\n${GREEN}============================================${NC}"
echo -e "${GREEN}   Deployment Complete!${NC}"
echo -e "${GREEN}============================================${NC}"

# Show running containers
echo -e "\n${BLUE}Running containers:${NC}"
docker compose -f "$COMPOSE_FILE" ps

# Show service URLs
echo -e "\n${BLUE}Service URLs:${NC}"
if [[ "$ENVIRONMENT" == "staging" ]]; then
    echo -e "  Backend API:  http://localhost:3001"
    echo -e "  Frontend:     http://localhost:8080"
    echo -e "  Database:     localhost:5433"
else
    echo -e "  Backend API:  http://localhost:3000"
    echo -e "  Frontend:     http://localhost:80"
    echo -e "  Database:     localhost:5432"
fi

echo -e "\n${GREEN}Done!${NC}"
