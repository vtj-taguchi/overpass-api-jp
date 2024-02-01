#!/bin/bash
mydir=$(dirname ${0})
checkfile=${mydir}/data/overpass-httpd/letsencrypt/deployed
echo ${checkfile}

pushd ${mydir}
docker exec overpass-httpd certbot renew --deploy-hook "touch /etc/letsencrypt/deployed"
if [ -e ${checkfile} ]; then
  docker compose restart overpass-httpd
  rm ${checkfile}
fi
popd
