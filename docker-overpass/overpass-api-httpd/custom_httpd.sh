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
echo 'Include conf/overpass-osmjp-common.conf' >>_
sed -i 's/CustomLog \/proc\/self\/fd\/1 common//g' _

ENVIRONMENT=$(grep -v -e '^\s*#' -e '^\s*$' ./environment.txt)
if [ ${ENVIRONMENT} != "TEST" ]; then
  sed -i 's/#LoadModule ssl_module/LoadModule ssl_module/g' _
  echo 'Include conf/overpass-osmjp-prov.conf' >>_
  grep -rl https://overpass-turbo.eu /usr/local/apache2/htdocs | xargs sed -i 's%https://overpass-turbo.eu%https://overpass.openstreetmap.jp/overpass-turbo%g'
fi

mv _ /usr/local/apache2/conf/httpd.conf
