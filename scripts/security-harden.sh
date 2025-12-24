#!/bin/bash
# ============================================
# Security Hardening Script
# ============================================
# Run this script on the production server
# to apply security configurations
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   Security Hardening Script${NC}"
echo -e "${BLUE}============================================${NC}"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}"
   exit 1
fi

# ==========================================
# 1. System Updates
# ==========================================
echo -e "\n${YELLOW}1. Updating system packages...${NC}"
apt-get update && apt-get upgrade -y
apt-get install -y fail2ban ufw unattended-upgrades

echo -e "${GREEN}✓ System updated${NC}"

# ==========================================
# 2. Configure Firewall (UFW)
# ==========================================
echo -e "\n${YELLOW}2. Configuring firewall...${NC}"

ufw default deny incoming
ufw default allow outgoing

# Allow SSH (rate limited)
ufw limit ssh

# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow monitoring (internal only - adjust as needed)
# ufw allow from 10.0.0.0/8 to any port 9090  # Prometheus
# ufw allow from 10.0.0.0/8 to any port 3002  # Grafana

# Enable firewall
ufw --force enable

echo -e "${GREEN}✓ Firewall configured${NC}"

# ==========================================
# 3. Configure Fail2Ban
# ==========================================
echo -e "\n${YELLOW}3. Configuring Fail2Ban...${NC}"

cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
ignoreip = 127.0.0.1/8

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 86400

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 5

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
bantime = 7200

[church-app-login]
enabled = true
filter = church-app-login
port = http,https
logpath = /opt/church_app/backend/logs/auth.log
maxretry = 5
bantime = 3600
EOF

# Create custom filter for app login
cat > /etc/fail2ban/filter.d/church-app-login.conf << 'EOF'
[Definition]
failregex = ^.*Failed login attempt.*IP: <HOST>.*$
            ^.*Invalid credentials.*IP: <HOST>.*$
ignoreregex =
EOF

systemctl restart fail2ban

echo -e "${GREEN}✓ Fail2Ban configured${NC}"

# ==========================================
# 4. SSH Hardening
# ==========================================
echo -e "\n${YELLOW}4. Hardening SSH...${NC}"

# Backup original config
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak

# Apply security settings
sed -i 's/#PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/#PubkeyAuthentication.*/PubkeyAuthentication yes/' /etc/ssh/sshd_config
sed -i 's/#MaxAuthTries.*/MaxAuthTries 3/' /etc/ssh/sshd_config
sed -i 's/#ClientAliveInterval.*/ClientAliveInterval 300/' /etc/ssh/sshd_config
sed -i 's/#ClientAliveCountMax.*/ClientAliveCountMax 2/' /etc/ssh/sshd_config

# Add security settings if not present
grep -q "AllowTcpForwarding" /etc/ssh/sshd_config || echo "AllowTcpForwarding no" >> /etc/ssh/sshd_config
grep -q "X11Forwarding" /etc/ssh/sshd_config || echo "X11Forwarding no" >> /etc/ssh/sshd_config

systemctl restart sshd

echo -e "${GREEN}✓ SSH hardened${NC}"

# ==========================================
# 5. Kernel Security Parameters
# ==========================================
echo -e "\n${YELLOW}5. Applying kernel security parameters...${NC}"

cat > /etc/sysctl.d/99-security.conf << 'EOF'
# IP Spoofing protection
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Ignore ICMP broadcast requests
net.ipv4.icmp_echo_ignore_broadcasts = 1

# Disable source packet routing
net.ipv4.conf.all.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0

# Ignore send redirects
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0

# Block SYN attacks
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.tcp_synack_retries = 2
net.ipv4.tcp_syn_retries = 5

# Log Martians
net.ipv4.conf.all.log_martians = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1

# Ignore ICMP redirects
net.ipv4.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0

# Disable IPv6 if not needed
# net.ipv6.conf.all.disable_ipv6 = 1
EOF

sysctl -p /etc/sysctl.d/99-security.conf

echo -e "${GREEN}✓ Kernel parameters applied${NC}"

# ==========================================
# 6. Docker Security
# ==========================================
echo -e "\n${YELLOW}6. Configuring Docker security...${NC}"

# Create Docker daemon configuration
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << 'EOF'
{
  "icc": false,
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "no-new-privileges": true,
  "userland-proxy": false,
  "live-restore": true
}
EOF

systemctl restart docker

echo -e "${GREEN}✓ Docker security configured${NC}"

# ==========================================
# 7. Automatic Security Updates
# ==========================================
echo -e "\n${YELLOW}7. Configuring automatic security updates...${NC}"

cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}";
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Mail "admin@church-app.local";
EOF

cat > /etc/apt/apt.conf.d/20auto-upgrades << 'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";
EOF

systemctl restart unattended-upgrades

echo -e "${GREEN}✓ Automatic updates configured${NC}"

# ==========================================
# Summary
# ==========================================
echo -e "\n${GREEN}============================================${NC}"
echo -e "${GREEN}   Security Hardening Complete!${NC}"
echo -e "${GREEN}============================================${NC}"
echo -e ""
echo -e "Applied security configurations:"
echo -e "  ✓ System packages updated"
echo -e "  ✓ UFW firewall enabled"
echo -e "  ✓ Fail2Ban installed and configured"
echo -e "  ✓ SSH hardened"
echo -e "  ✓ Kernel security parameters applied"
echo -e "  ✓ Docker security configured"
echo -e "  ✓ Automatic security updates enabled"
echo -e ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Add your SSH public key to ~/.ssh/authorized_keys"
echo -e "  2. Test SSH login before closing current session"
echo -e "  3. Review firewall rules: ufw status"
echo -e "  4. Check fail2ban status: fail2ban-client status"
