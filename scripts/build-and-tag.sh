#!/bin/bash

###############################################################################
# BookingCare Frontend Admin - Build and Tag Docker Image Script
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOCKER_USERNAME="${DOCKER_USERNAME:-hiumx}"
VERSION="${VERSION:-1.0.0}"
FRONTEND_ADMIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)/booking-care-system-ui-admin"

# Image name
IMAGE_NAME="bookingcare-ui-admin"
FULL_IMAGE_NAME="${DOCKER_USERNAME}/${IMAGE_NAME}"

# Build arguments from .env.production
ENV_FILE="${FRONTEND_ADMIN_DIR}/.env.production"

###############################################################################
# Functions
###############################################################################

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

load_env_vars() {
    if [ ! -f "$ENV_FILE" ]; then
        print_error ".env.production not found at: $ENV_FILE"
        exit 1
    fi
    
    print_info "Loading environment variables from .env.production"
    
    # Export variables from .env file
    export $(grep -v '^#' "$ENV_FILE" | xargs)
}

build_image() {
    print_info "Building Docker image: ${FULL_IMAGE_NAME}:${VERSION}"
    
    # Check if Dockerfile exists
    if [ ! -f "${FRONTEND_ADMIN_DIR}/Dockerfile" ]; then
        print_error "Dockerfile not found at: ${FRONTEND_ADMIN_DIR}/Dockerfile"
        exit 1
    fi
    
    # Build the image with build arguments
    docker build \
        --build-arg MABS_APP_NAME="${MABS_APP_NAME}" \
        --build-arg VITE_RECAPTCHA_SITE_KEY="${VITE_RECAPTCHA_SITE_KEY}" \
        --build-arg VITE_API_URL="${VITE_API_URL}" \
        --build-arg VITE_GOOGLE_CLIENT_ID="${VITE_GOOGLE_CLIENT_ID}" \
        --build-arg VITE_FACEBOOK_APP_ID="${VITE_FACEBOOK_APP_ID}" \
        -t "${FULL_IMAGE_NAME}:${VERSION}" \
        -t "${FULL_IMAGE_NAME}:latest" \
        -f "${FRONTEND_ADMIN_DIR}/Dockerfile" \
        "${FRONTEND_ADMIN_DIR}" \
        || { print_error "Failed to build image"; exit 1; }
    
    print_info "✓ Successfully built ${FULL_IMAGE_NAME}:${VERSION}"
}

###############################################################################
# Main Script
###############################################################################

main() {
    print_header "BookingCare Frontend Admin - Build and Tag Image"
    
    # Display configuration
    echo -e "${BLUE}Configuration:${NC}"
    echo "  Docker Username: ${DOCKER_USERNAME}"
    echo "  Version: ${VERSION}"
    echo "  Frontend Directory: ${FRONTEND_ADMIN_DIR}"
    echo "  Image Name: ${FULL_IMAGE_NAME}"
    echo ""
    
    # Load environment variables
    load_env_vars
    
    # Display build args (masked)
    echo -e "${BLUE}Build Arguments:${NC}"
    echo "  MABS_APP_NAME: ${MABS_APP_NAME}"
    echo "  VITE_RECAPTCHA_SITE_KEY: ${VITE_RECAPTCHA_SITE_KEY:0:20}..."
    echo "  VITE_API_URL: ${VITE_API_URL}"
    echo "  VITE_GOOGLE_CLIENT_ID: ${VITE_GOOGLE_CLIENT_ID:0:30}..."
    echo "  VITE_FACEBOOK_APP_ID: ${VITE_FACEBOOK_APP_ID}"
    echo ""
    
    # Confirm before proceeding
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Build cancelled by user"
        exit 0
    fi
    
    # Build image
    build_image
    
    # Print summary
    echo ""
    print_header "Build Summary"
    echo -e "${GREEN}Image built successfully!${NC}"
    echo ""
    
    # List built images
    print_header "Built Images"
    docker images | grep "${IMAGE_NAME}"
    
    echo ""
    print_info "Build complete! You can now:"
    print_info "  1. Test locally: docker run -p 3001:80 ${FULL_IMAGE_NAME}:${VERSION}"
    print_info "  2. Push to Docker Hub: docker push ${FULL_IMAGE_NAME}:${VERSION}"
}

# Run main function
main "$@"
