# Laboard

A kanban board made for Gitlab

* [Requirements](#requirements)
* [How does it work](#how-does-it-work)
* [Installation](#installation)
* [Configuration](#configuration)
* [Start](#start)
* [Hacking](#hacking)

## Requirements

* nodejs `~ 0.10.26`
* Gitlab `>= 7.1`

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
$ git clone https://gitlab.com/jubianchi/laboard.git
$ cd laboard
$ gulp app
```

## Configuration

The Laboard configuration is minimal:

* `config/server.json`:
  * `gitlab_url` : The URL to your Gitlab instance (for example `http://gitlab.example.com`)
  * `data_dir` : Path to a directory where Laboard will store its data (columns definition)
  * `port`: Port to which the HTTP server is bound
  * `column_prefix`: Prefix for gitlab issue label to map columns, for example an issue in the column _backlog_ will have the label `column:backlog`
  * `theme_prefix`: Prefix for gitlab issue label, for example a red issue will have label `theme:danger`
  * `mysql`: Configuration of the database
    * `host`: Hostname of the server
    * `user`: Username to connect with the server
    * `password`: Password of the user
    * `database`: Name of the database
* `config/client.js`:
  * `gitlabUrl`: The URL to your Gitlab instance. **This should be the same as for the server** (for example `http://gitlab.example.com`)
  * `socketIoPort`: The port to which the Socket.io server is bound. When running in production, this will be the same as the HTTP server's port

## Database

To keep track of issues and generate fanct charts, we use a MySQL database. This structure is required:

```mysql
CREATE TABLE `moves` (
  `namespace` varchar(255) DEFAULT NULL,
  `project` varchar(255) DEFAULT NULL,
  `issue` int(11) DEFAULT NULL,
  `from` varchar(255) DEFAULT NULL,
  `to` varchar(255) DEFAULT NULL,
  `date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

## Start

Starting the application is really easy:

```sh
$ cd laboard
$ npm start
```

## Hacking

If you want to hack into Laboard, first, follow the installation guide. Once you are done, you'll be able to start Laboard 
locally thanks to the Gulp `server` (or `default`) task.

**PRs/MRs/Issues are appreciated**

## License

**Laboard** is licensed under [MIT license](http://opensource.org/licenses/MIT)
