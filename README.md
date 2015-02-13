# Laboard [![Build Status](https://semaphoreapp.com/api/v1/projects/3c6af62b-be9e-40ba-bf10-b2f322d137cc/344279/badge.png)](https://semaphoreapp.com/jubianchi/laboard)

A kanban board made for Gitlab

* [Requirements](#requirements)
* [How does it work](#how-does-it-work)
* [Installation](#installation)
* [Configuration](#configuration)
* [Start](#start)
* [Hacking](#hacking)

## Requirements

* nodejs `~ 0.10.26` or docker `>= 1.4.1`
* Gitlab `> 7.1`

## How does it work

Laboard uses a file storage for columns definition. This is the only thing it stores by itself. Everything else is managed
with issues labels.

Adding an issue to a column will place a special label on it (`column:*`). This is how it works. Of course, Laboard keeps
everything clean and removes useless labels when issues are moved. This will keep your issue tracker clean and provides you
a clear view on the board.

## Installation

The installation proccess is quite simple. You will first have to install some tools:

```sh
$ npm install -g bower gulp
```

Then clone the source repository and run `gulp`:

```sh
$ git clone https://gitlab.com/laboard/laboard.git
$ cd laboard
$ npm install
$ bower install
```

## Configuration

The Laboard configuration is minimal:

* `config/server.js`:
  * `gitlab_url` : The URL to your Gitlab instance (for example `http://gitlab.example.com`)
  * `port`: Port to which the HTTP server is bound
  * `column_prefix`: Prefix for gitlab issue label to map columns, for example an issue in the column _backlog_ will have the label `column:backlog`
  * `theme_prefix`: Prefix for gitlab issue label, for example a red issue will have label `theme:danger`
  * `board_prefix`: Prefix for gitlab issue label, for example a starred issue will have label `board:starred`
  * `redis`: Configuration of the redis server
    * `host`: Hostname of the server
    * `port`: Port to connect to

## Start

### Docker

If you already have [docker](https://www.docker.com/) installed, starting laboard is a simple one-liner:

```sh
$ docker run --name=redis --detach redis
$ docker run --name=laboard --link=redis:redis --publish=8080:8080 laboard/laboard
```

Ok, it's a two-liner actually.


Laboard should now be reachable using the [http://localhost:8080](http://localhost:8080) URL. If you are running docker through
[boot2docker](http://boot2docker.io/) you will have to replace `localhost` with the URL of the VM. You can get it by running `boot2docker ip`.

### No docker

If you don't want to install docker on your machine, you will still have to have nodejs installed. And redis.
Once everything is set up, run the following commands in the laboard's root directory:

```sh
$ npm install
$ bower install
$ node bin/server.js # OR gulp server
```

Do not forget to `export NODE_ENV=production` before running the above commands if you are running laboard on a production machine.

## Hacking

If you want to hack into Laboard, first, follow the installation guide. Once you are done, you'll be able to start Laboard 
locally thanks to [docker](https://www.docker.com/) and [fig](http://www.fig.sh/).

Using the `fig up` command you will get an environment with the following containers:

* a `data` container mapping the `.`, `data` and `docker` directories
* a `redis` container
* a `commander` container to manage redis (listenning on port `8282`)
* a `api` container serving the laboard API
* a `static` container serving the frontend code
* two `websocket` container serving laboard websocket
* a `haproxy` container in front of laboard containers

**Every `gulp` related command should be launched on the host machine to avoid side-effects. This includes common tasks
like `app` or `watch`, and test tasks like `karma` or `test`.**

**Before running tests, be sure to define the `NODE_ENV=test`.**

## License

**Laboard** is licensed under [MIT license](http://opensource.org/licenses/MIT)
