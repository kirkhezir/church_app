#!/bin/bash
# ============================================
# SSL Certificate Setup Script
# ============================================
# Generates self-signed certs for development
# or obtains Let's Encrypt certs for production
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default values
DOMAIN="${1:-localhost}"
EMAIL="${2:-admin@example.com}"
MODE="${3:-self-signed}"  # self-signed or letsencrypt

SSL_DIR="./nginx/ssl"
CERTBOT_DIR="./certbot"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   SSL Certificate Setup${NC}"
echo -e "${BLUE}============================================${NC}"
echo -e "Domain: ${DOMAIN}"
echo -e "Mode: ${MODE}"
echo -e ""

# Create directories
mkdir -p "$SSL_DIR"
mkdir -p "$CERTBOT_DIR/conf"
mkdir -p "$CERTBOT_DIR/www"

if [[ "$MODE" == "self-signed" ]]; then
    echo -e "${YELLOW}Generating self-signed certificate...${NC}"
    
    # Generate DH parameters if not exists
    if [[ ! -f "$SSL_DIR/dhparam.pem" ]]; then
        echo -e "${BLUE}Generating DH parameters (this may take a while)...${NC}"
        openssl dhparam -out "$SSL_DIR/dhparam.pem" 2048
    fi
    
    # Generate self-signed certificate
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$SSL_DIR/privkey.pem" \
        -out "$SSL_DIR/fullchain.pem" \
        -subj "/CN=${DOMAIN}/O=Church App/C=US" \
        -addext "subjectAltName=DNS:${DOMAIN},DNS:www.${DOMAIN},IP:127.0.0.1"
    
    echo -e "${GREEN}✓ Self-signed certificate generated${NC}"
    echo -e "${YELLOW}Note: Browsers will show a security warning for self-signed certs${NC}"

elif [[ "$MODE" == "letsencrypt" ]]; then
    echo -e "${YELLOW}Obtaining Let's Encrypt certificate...${NC}"
    
    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        echo -e "${RED}Error: certbot is not installed${NC}"
        echo -e "Install with: sudo apt-get install certbot"
        exit 1
    fi
    
    # Generate DH parameters if not exists
    if [[ ! -f "$SSL_DIR/dhparam.pem" ]]; then
        echo -e "${BLUE}Generating DH parameters...${NC}"
        openssl dhparam -out "$SSL_DIR/dhparam.pem" 2048
    fi
    
    # Obtain certificate
    certbot certonly --webroot \
        -w "$CERTBOT_DIR/www" \
        -d "$DOMAIN" \
        -d "www.$DOMAIN" \
        --email "$EMAIL" \
        --agree-tos \
        --non-interactive \
        --expand
    
    # Copy certificates
    cp "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" "$SSL_DIR/"
    cp "/etc/letsencrypt/live/${DOMAIN}/privkey.pem" "$SSL_DIR/"
    
    echo -e "${GREEN}✓ Let's Encrypt certificate obtained${NC}"
    
    # Setup auto-renewal
    echo -e "${BLUE}Setting up auto-renewal...${NC}"
    cat > /etc/cron.d/certbot-renewal << EOF
# Certbot renewal - runs twice daily
0 0,12 * * * root certbot renew --quiet --post-hook "docker compose restart frontend"
EOF
    echo -e "${GREEN}✓ Auto-renewal configured${NC}"

else
    echo -e "${RED}Error: Invalid mode. Use 'self-signed' or 'letsencrypt'${NC}"
    exit 1
fi

# Set permissions
chmod 600 "$SSL_DIR/privkey.pem"
chmod 644 "$SSL_DIR/fullchain.pem"
chmod 644 "$SSL_DIR/dhparam.pem"

echo -e ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}   Certificate Setup Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo -e ""
echo -e "Certificate files:"
echo -e "  - $SSL_DIR/fullchain.pem"
echo -e "  - $SSL_DIR/privkey.pem"
echo -e "  - $SSL_DIR/dhparam.pem"
