FROM alpine:3.18.5 AS build
RUN apk add g++ make expat expat-dev zlib-dev lz4-dev bash
COPY build.sh ./build.sh
RUN ./build.sh

FROM alpine:3.18.5
RUN apk add --no-cache libstdc++ expat lz4-dev bash python3 py3-pip && \
  python3 -m pip install prometheus_client
COPY run.sh ./run.sh
COPY overpass-exporter.py ./overpass-exporter.py
COPY --from=build /overpass /overpass
ENV init_from_clone=""
ENV overpass_areas=""
ENTRYPOINT ["./run.sh"]
