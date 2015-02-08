FROM hwestphal/nodebox

RUN sed -i 's?x86_64/packages/?x86_64/generic/packages/?' /etc/opkg.conf && \
    opkg-cl update && \
    opkg-cl upgrade

ENV NODE_ENV=production

RUN npm install -g pm2

RUN rm -f /var/log && \
    rm -f /var/run && \
    mkdir -p /var/log/laboard && \
    mkdir -p /var/run/laboard

VOLUME /var/log/laboard
VOLUME /var/run/laboard

RUN mkdir -p /app/config && \
    mkdir -p /app/client/public

COPY ./bin /app/bin
COPY ./server /app/server
COPY ./client/public /app/client/public
COPY ./config/client.js-dist /app/client/public/assets/js/config.js
COPY ./config/server.js-dist /app/config/server.js

WORKDIR /app

COPY ./package.json /app/package.json
RUN npm install && \
    npm dedupe && \
    npm cache clean && \
    (rm -rf /tmp/* || true)

ENTRYPOINT ["pm2", "--no-daemon"]
CMD ["--log", "/var/log/laboard/laboard.log", "--pid", "/var/run/laboard/laboard.pid", "--name", "laboard", "start", "bin/server.js"]

EXPOSE 8080
