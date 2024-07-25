#/bin/bash

mkdir -p data/grafana
mkdir -p data/loki
mkdir -p data/mimir
mkdir -p data/overpass-httpd/letsencrypt
mkdir -p data/overpass-server/db

sudo chown -R 472:472 data/grafana
sudo chown -R 10001:10001 data/loki

echo Local_IPAddr=`ip -f inet -o addr show eno1 | cut -d\  -f 7 | cut -d/ -f 1` > .env

docker plugin install grafana/loki-docker-driver:latest --alias loki --grant-all-permissions
#docker composer build