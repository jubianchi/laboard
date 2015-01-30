FROM hwestphal/nodebox

RUN npm install -g pm2 gulp bower

ADD . /app

VOLUME /var/log/laboard
VOLUME /var/run/laboard

WORKDIR /app

RUN sed -i 's?x86_64/packages/?x86_64/generic/packages/?' /etc/opkg.conf && \
    opkg-cl update && \
    opkg-cl upgrade

RUN npm install --production && \
    npm dedupe && \
    bower install --production --allow-root && \
    gulp app && \
    rm -rf bower_components && \
    ls -lha

RUN bower cache clean --allow-root && \
    npm uninstall -g gulp bower && \
    npm cache clean && \
    rm -rf /tmp/npm*

ENTRYPOINT ["pm2", "--no-daemon"]
CMD ["--log", "/var/log/laboard/laboard.log", "--pid", "/var/run/laboard/laboard.pid", "--name", "laboard", "start", "bin/server.js"]
