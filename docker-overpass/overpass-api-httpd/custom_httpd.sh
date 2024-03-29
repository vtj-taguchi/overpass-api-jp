#!/usr/bin/env bash

cat /usr/local/apache2/conf/httpd.conf | awk \
  '{ print; if ($1 == "ScriptAlias" && !inserted) { print "ScriptAlias /api/ \"/overpass/cgi-bin/\""; inserted = 1; } }' >_

echo '<Directory "/overpass/cgi-bin">' >>_
echo '    AllowOverride None' >>_
echo '    Options None' >>_
echo '    Require all granted' >>_
echo '    SetEnv OVERPASS_DB_DIR "/overpass/db/"' >>_
echo '</Directory>' >>_

echo -n -e '\n' >>_
echo 'Include conf/server-status.conf' >>_

ENVIRONMENT=$(grep -v -e '^\s*#' -e '^\s*$' ./environment.txt)
if [ ${ENVIRONMENT} != "TEST" ]; then
  echo 'Include conf/ssl-overpass-osm-jp.conf' >>_
  echo 'Include conf/rewrite.conf' >>_
  sed -i 's/#LoadModule ssl_module/LoadModule ssl_module/g' _
  sed -i 's/#LoadModule socache_shmcb_module/LoadModule socache_shmcb_module/g' _
  sed -i 's/#LoadModule vhost_alias_module/LoadModule vhost_alias_module/g' _
  sed -i 's/#LoadModule rewrite_module/LoadModule rewrite_module/g' _
  grep -rl https://overpass-turbo.eu /usr/local/apache2/htdocs | xargs sed -i 's%https://overpass-turbo.eu%https://overpass.openstreetmap.jp/overpass-turbo%g'
fi

mv _ /usr/local/apache2/conf/httpd.conf
