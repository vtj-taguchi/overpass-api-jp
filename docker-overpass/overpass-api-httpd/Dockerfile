FROM alpine:3.18.5 AS build
RUN apk add g++ make expat expat-dev zlib-dev lz4-dev bash
COPY build.sh ./build.sh
RUN ./build.sh

FROM node:20.11.0 AS nodejs-app-build
COPY city-roads city-roads/
RUN cd /city-roads && \
    npm install && \
    npm run build
COPY overpass-turbo overpass-turbo/
RUN cd /overpass-turbo && \
    yarn install && \
    yarn build

FROM httpd:2.4-alpine
RUN apk add --no-cache libstdc++ expat lz4-dev bash apache2-ssl certbot
COPY --from=build /overpass /overpass
RUN mv /overpass/html/* /usr/local/apache2/htdocs/
COPY custom_httpd.sh ./custom_httpd.sh
RUN ./custom_httpd.sh
COPY --from=nodejs-app-build /city-roads/dist /usr/local/apache2/htdocs/city-roads
COPY --from=nodejs-app-build /overpass-turbo/dist /usr/local/apache2/htdocs/overpass-turbo
CMD httpd-foreground -c "LoadModule cgid_module modules/mod_cgid.so"

