#/bin/bash

FILES_BASE="\
nodes.bin nodes.map node_tags_local.bin node_tags_global.bin node_frequent_tags.bin node_keys.bin \
ways.bin ways.map way_tags_local.bin way_tags_global.bin way_frequent_tags.bin way_keys.bin \
relations.bin relations.map relation_roles.bin relation_tags_local.bin relation_tags_global.bin relation_frequent_tags.bin relation_keys.bin \
nodes_meta.bin ways_meta.bin relations_meta.bin user_data.bin user_indices.bin"

URL_BASE="https://dev.overpass-api.de/clone/2024-02-17"
LOCAL_BASE="/home/ubuntu/overpass-api-jp/data/overpass-server/db"

curl -sS -o $LOCAL_BASE/replicate_id $URL_BASE/replicate_id

for f in $FILES_BASE
do
  #wget -nv -P $LOCAL_BASE -O $f $URL_BASE/$f
  #wget -nv -P $LOCAL_BASE -O $f.idx $URL_BASE/$f.idx
  echo Download $f
  curl -sS -o $LOCAL_BASE/$f $URL_BASE/$f
  echo Download $f.idx
  curl -sS -o $LOCAL_BASE/$f.idx $URL_BASE/$f.idx
done
