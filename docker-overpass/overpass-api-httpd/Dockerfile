FROM alpine:3.18.5 AS build
RUN apk add g++ make expat expat-dev zlib-dev lz4-dev bash
COPY build.sh ./build.sh
RUN ./build.sh

FROM node:21.5.0 AS city-roads
COPY city-roads city-roads/
RUN cd /city-roads && \
    npm install && \
    npm run build

FROM httpd:2.4-alpine
RUN apk add libstdc++ expat lz4-dev bash
COPY --from=build /overpass /overpass
RUN mv /overpass/html/* /usr/local/apache2/htdocs/
COPY custom_httpd.sh ./custom_httpd.sh
RUN ./custom_httpd.sh
COPY --from=city-roads /city-roads/dist /usr/local/apache2/htdocs/city-roads
CMD httpd-foreground -c "LoadModule cgid_module modules/mod_cgid.so"

