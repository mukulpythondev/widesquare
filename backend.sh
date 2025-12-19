cd /var/www/repo-widesquare
git pull

rsync -av --delete --exclude='.env' backend/ /var/www/backend/

cd /var/www/backend
npm install
pm2 restart backend
