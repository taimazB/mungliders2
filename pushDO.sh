DO=taimaz@159.203.6.104

rsync -aruvz --exclude-from='.exclude' --delete . ${DO}:web
