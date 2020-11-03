DO=taimaz@159.203.6.104

rsync -aruvz --exclude '*.nc' --exclude ".git" --delete . ${DO}:web
