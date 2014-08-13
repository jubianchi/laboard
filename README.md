# Laboard

A kanban board made for Gitlab

* [Requirements](#requirements)
* [How does it work](#how-does-it-work)
* [Installation](#installation)
* [Configuration](#configuration)
* [Start](#start)
* [Hacking](#hacking)

## Requirements

* nodejs v0.10.*

## How does it work

Laboard uses a file storage for columns definition. This is the only thing it stores by itself. Everything else is managed
with issues labels. 

Adding an issue to a column will place a special label on it (`column:*`). This is how it works. Of course, Laboard keeps
everything clean and removes useless labels when issues are moved. This will keep your issue tracker clean and provides you
a clear view on the board.

## Installation

The installation proccess is quite simple: a `Makefile` is provided in the repository to let you get started quickly.

```
$ git clone https://gitlab.com/jubianchi/laboard.git
$ cd laboard
$ make install
```

### Manual installation

```
$ git clone https://github.com/jubianchi/laboard.git
$ cd laboard

$ cd client
$ npm install
$ bower install
$ gulp app

$ cd ../server
$ npm install

$ cd ../
$ cp config/client.js-dist config/client.js
$ vim config/client.js

$ cp config/server.json-dist config/server.json
$ vim config/server.json
```

## Configuration

The Laboard configuration is minimal:

* `config/server.json`:
  * `gitlab_url` : The URL to your Gitlab instance (for example `http://gitlab.example.com`)
  * `data_dir` : Path to a directory where Laboard will store its data (columns definition)
  * `port`: Port to which the HTTP server is bound
* `config/client.js`:
  * `gitlabUrl`: The URL to your Gitlab instance. **This should be the same as for the server** (for example `http://gitlab.example.com`)
  * `socketIoPort`: The port to which the Socket.io server is bound. When running in production, this will be the same as the HTTP server's port

## Start

Starting the application is really easy:

```
$ cd laboard
$ node server/server.js
```

## Hacking

If you want to hack into Laboard, first, follow the installation guide. Once you are done, you'll be able to start Laboard 
locally thanks to the Gulp `server` task.

When running Laboard in development, you will have to map the nodejs server and the Socket.io server to two distinct ports.
Check out the configuration files for the server and the client.


**PRs/MRs/Issues are appreciated**

## License

**Laboard** is licensed under [MIT license](http://opensource.org/licenses/MIT)
