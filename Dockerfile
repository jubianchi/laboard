FROM hwestphal/nodebox

ENV NODE_ENV=production

RUN mkdir -p /app/client/public && \
    mkdir -p /var/log/laboard && \
    mkdir -p /var/run/laboard

ADD ./bin /app/bin
ADD ./config /app/config
ADD ./server /app/server
ADD ./client/public /app/client/public
ADD ./package.json /app/package.json

VOLUME /var/log/laboard
VOLUME /var/run/laboard

WORKDIR /app

RUN sed -i 's?x86_64/packages/?x86_64/generic/packages/?' /etc/opkg.conf && \
    opkg-cl update && \
    opkg-cl upgrade

RUN npm install -g pm2 && \
    npm install

RUN npm dedupe && \
    npm cache clean && \
    (rm -rf /tmp/* || true)

ENTRYPOINT ["pm2", "--no-daemon"]
CMD ["--log", "/var/log/laboard/laboard.log", "--pid", "/var/run/laboard/laboard.pid", "--name", "laboard", "start", "bin/server.js"]
