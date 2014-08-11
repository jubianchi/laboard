server: install config/server.json
	cd client && gulp

install: client/public server/node_modules

.PHONY: server install

config/server.json:
	cp config/server.json-dist config/server.json

client/public: client/node_modules client/bower_components
	cd client && gulp app

client/node_modules:
	cd client && npm install

client/bower_components:
	cd client && bower install

server/node_modules:
	cd server && npm install
