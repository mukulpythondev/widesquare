# Build locally
cd frontend
npm run build

# Remove old VPS files
ssh root@134.209.152.160 "rm -rf /var/www/widesquare/*"

# Upload build to VPS
scp -r dist/* root@134.209.152.160:/var/www/widesquare/

# Reload nginx
ssh root@134.209.152.160 "systemctl reload nginx"

echo "🚀 Frontend deployed successfully!"
