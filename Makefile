GITLAB_URL ?= $(shell read -p "Gitlab URL (http://gitlab.example.com): ";echo $$REPLY)
LABOARD_PORT ?= $(shell read -p "Laboard port (defaults to 80): ";echo $$REPLY)
SOCKETIO_PORT ?= $(shell read -p "Socket IO port (defaults to 80): ";echo $$REPLY)

server: config install
	cd client && gulp

install: config
	@echo "\033[34m=> Installing Laboard backend\033[0m"
	@make server/node_modules
	@echo "\033[34m=> Installing Laboard frontend\033[0m"
	@make client/public

config:
	@echo "\033[34m=> Configuring Laboard backend\033[0m"
	@make config/server.json
	@echo "\033[34m=> Configuring Laboard frontend\033[0m"
	@make config/client.js

.PHONY: server install config

config/server.json:
	@cp config/server.json-dist config/server.json
	@sed -i "s#http://gitlab.example.com#$(GITLAB_URL)#" config/server.json
	@sed -i "s#\"port\": 80#\"port\": $(LABOARD_PORT)#" config/server.json

config/client.js:
	@cp config/client.js-dist config/client.js
	@sed -i "s#http://gitlab.example.com#$(GITLAB_URL)#" config/client.js
	@sed -i "s#socketIoPort: 80#socketIoPort: $(SOCKETIO_PORT)#" config/client.js

client/public: client/node_modules client/bower_components
	@cd client && gulp app

client/node_modules:
	@cd client && npm install

client/bower_components:
	@cd client && bower install

server/node_modules:
	@cd server && npm install
