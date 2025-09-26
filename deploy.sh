#!/bin/bash

# T.G.'s Tires Production Deployment Script
# This script handles secure deployment with proper validation

set -e

echo "🚀 Starting T.G.'s Tires deployment..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
BACKUP_DIR="./backups"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Pre-deployment checks
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi

    # Check if docker-compose is available
    if ! command -v docker-compose &> /dev/null; then
        log_error "docker-compose is not installed or not in PATH."
        exit 1
    fi

    # Check if environment file exists
    if [ ! -f "$ENV_FILE" ]; then
        log_warning "Production environment file not found at $ENV_FILE"
        log_info "Please copy .env.example to $ENV_FILE and configure your variables"
        exit 1
    fi

    # Check if compose file exists
    if [ ! -f "$COMPOSE_FILE" ]; then
        log_error "Docker compose file not found at $COMPOSE_FILE"
        exit 1
    fi

    log_success "Prerequisites check passed"
}

# Validate environment variables
validate_environment() {
    log_info "Validating environment variables..."

    source "$ENV_FILE"

    # Critical variables that must be set
    REQUIRED_VARS=(
        "NODE_ENV"
        "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
        "CLERK_SECRET_KEY"
        "STRIPE_SECRET_KEY"
        "DATABASE_PASSWORD"
        "REDIS_PASSWORD"
    )

    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            log_error "Required environment variable $var is not set"
            exit 1
        fi
    done

    # Check if NODE_ENV is production
    if [ "$NODE_ENV" != "production" ]; then
        log_warning "NODE_ENV is not set to 'production'. Current value: $NODE_ENV"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi

    log_success "Environment validation passed"
}

# Create backup
create_backup() {
    if [ "$1" = "--skip-backup" ]; then
        log_info "Skipping backup as requested"
        return
    fi

    log_info "Creating backup..."

    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz"

    # Check if containers are running and create database backup
    if docker-compose -f "$COMPOSE_FILE" ps | grep -q "postgres"; then
        log_info "Creating database backup..."
        docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U "$DATABASE_USER" "$DATABASE_NAME" > "$BACKUP_DIR/db-$(date +%Y%m%d-%H%M%S).sql"
    fi

    # Create application backup (excluding node_modules and logs)
    tar -czf "$BACKUP_FILE" \
        --exclude='node_modules' \
        --exclude='.next' \
        --exclude='*.log' \
        --exclude='.git' \
        --exclude='backups' \
        .

    log_success "Backup created: $BACKUP_FILE"
}

# Build and deploy
deploy() {
    log_info "Building and deploying application..."

    # Pull latest images
    log_info "Pulling latest base images..."
    docker-compose -f "$COMPOSE_FILE" pull

    # Build application
    log_info "Building application image..."
    docker-compose -f "$COMPOSE_FILE" build --no-cache app

    # Stop existing containers gracefully
    log_info "Stopping existing containers..."
    docker-compose -f "$COMPOSE_FILE" down --timeout 30

    # Start services
    log_info "Starting services..."
    docker-compose -f "$COMPOSE_FILE" up -d

    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 30

    # Check health
    check_deployment_health
}

# Health check
check_deployment_health() {
    log_info "Checking deployment health..."

    # Check if containers are running
    if ! docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        log_error "Some containers are not running properly"
        docker-compose -f "$COMPOSE_FILE" logs --tail=50
        exit 1
    fi

    # Check application health endpoint
    for i in {1..10}; do
        if curl -f http://localhost:3000/api/health &> /dev/null; then
            log_success "Application is healthy and responding"
            break
        else
            log_info "Waiting for application to be ready... (attempt $i/10)"
            sleep 10
        fi

        if [ $i -eq 10 ]; then
            log_error "Application health check failed after 10 attempts"
            docker-compose -f "$COMPOSE_FILE" logs app --tail=50
            exit 1
        fi
    done
}

# Cleanup old images and containers
cleanup() {
    log_info "Cleaning up old Docker images and containers..."

    # Remove old images
    docker image prune -f

    # Remove unused volumes (be careful with this in production)
    # docker volume prune -f

    log_success "Cleanup completed"
}

# Show deployment info
show_deployment_info() {
    log_success "Deployment completed successfully!"
    echo
    echo "📊 Deployment Information:"
    echo "========================="
    echo "🔗 Application URL: http://localhost:3000"
    echo "🔗 Health Check: http://localhost:3000/api/health"
    echo
    echo "📋 Running Services:"
    docker-compose -f "$COMPOSE_FILE" ps
    echo
    echo "💾 Disk Usage:"
    docker system df
    echo
    echo "📖 To view logs: docker-compose -f $COMPOSE_FILE logs -f"
    echo "🛑 To stop services: docker-compose -f $COMPOSE_FILE down"
}

# Main deployment flow
main() {
    echo "T.G.'s Tires - Production Deployment"
    echo "===================================="
    echo

    # Parse command line arguments
    SKIP_BACKUP=false
    SKIP_HEALTH_CHECK=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-backup)
                SKIP_BACKUP=true
                shift
                ;;
            --skip-health-check)
                SKIP_HEALTH_CHECK=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --skip-backup       Skip backup creation"
                echo "  --skip-health-check Skip health check"
                echo "  --help              Show this help message"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    # Execute deployment steps
    check_prerequisites
    validate_environment

    if [ "$SKIP_BACKUP" = false ]; then
        create_backup
    fi

    deploy

    if [ "$SKIP_HEALTH_CHECK" = false ]; then
        check_deployment_health
    fi

    cleanup
    show_deployment_info
}

# Run main function with all arguments
main "$@"