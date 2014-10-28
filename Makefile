GITLAB_URL ?= $(shell read -p "Gitlab URL (http://gitlab.example.com): ";echo $$REPLY)
LABOARD_PORT ?= $(shell read -p "Laboard port (defaults to 80): ";echo $$REPLY)
SOCKETIO_PORT ?= $(shell read -p "Socket IO port (defaults to 80): ";echo $$REPLY)

server: config install
	@node_modules/gulp/bin/gulp.js

install: config
	@echo "\033[34m=> Installing Laboard backend\033[0m"
	@make node_modules
	@echo "\033[34m=> Installing Laboard frontend\033[0m"
	@make client/public

config:
	@echo "\033[34m=> Configuring Laboard backend\033[0m"
	@make config/server.json
	@echo "\033[34m=> Configuring Laboard frontend\033[0m"
	@make config/client.js

.PHONY: server install config test

config/server.json:
	@sed \
	    -e "s#http://gitlab.example.com#$(GITLAB_URL)#" \
	    -e "s#\"port\": 80#\"port\": $(LABOARD_PORT)#" \
	    config/server.json-dist > config/server.json

config/client.js:
	@sed \
	    -e "s#http://gitlab.example.com#$(GITLAB_URL)#" \
	    -e "s#socketIoPort: 80#socketIoPort: $(SOCKETIO_PORT)#" \
	    config/client.js-dist > config/client.js

client/public: bower_components
	@node_modules/gulp/bin/gulp.js app

node_modules:
	@npm install

bower_components: node_modules
	@node_modules/bower/bin/bower install
