# Multi-stage build for BookingCare System UI Admin
# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies with cache optimization
RUN npm ci --prefer-offline --no-audit --progress=false

# Copy source code
COPY . .

# Build arguments for environment variables
ARG MABS_APP_NAME
ARG VITE_RECAPTCHA_SITE_KEY
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_FACEBOOK_APP_ID

# Set build-time environment variables
ENV MABS_APP_NAME=${MABS_APP_NAME}
ENV VITE_RECAPTCHA_SITE_KEY=${VITE_RECAPTCHA_SITE_KEY}
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
ENV VITE_FACEBOOK_APP_ID=${VITE_FACEBOOK_APP_ID}

# Build the application
RUN npm run build

# Stage 2: Production image with Nginx
FROM nginx:1.25-alpine

# Install gettext for envsubst command
RUN apk add --no-cache gettext

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy env template for runtime environment variable substitution
COPY .env.production /usr/share/nginx/html/.env.template

# Create startup script for runtime env substitution
RUN echo '#!/bin/sh' > /docker-entrypoint.d/40-envsubst-on-templates.sh && \
    echo 'set -e' >> /docker-entrypoint.d/40-envsubst-on-templates.sh && \
    echo 'if [ -f "/usr/share/nginx/html/.env.template" ]; then' >> /docker-entrypoint.d/40-envsubst-on-templates.sh && \
    echo '  envsubst < /usr/share/nginx/html/.env.template > /usr/share/nginx/html/.env' >> /docker-entrypoint.d/40-envsubst-on-templates.sh && \
    echo 'fi' >> /docker-entrypoint.d/40-envsubst-on-templates.sh && \
    chmod +x /docker-entrypoint.d/40-envsubst-on-templates.sh

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
