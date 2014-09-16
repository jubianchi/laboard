var mock = {
    reset: function() {
        this.users = {};
        this.projects = {};
        this.issues = {};
        this.columns = {};
        this.loggedIn = false;
    },

    setBackend: function(backend) {
        var self = this;

        this.backend = backend;

        this.backend.whenPOST('/login').respond(function(method, url, data, headers) {
            var status = 401,
                content;

            data = JSON.parse(data);

            if (self.users[data.password]) {
                status = 200;
                content = self.users[data.password];
            }

            self.loggedIn = content;

            return [status, content]
        });

        this.backend.whenGET('/login/check').respond(function(method, url, data, headers) {
            return self.loggedIn ? [200, self.loggedIn] : [401];
        });

        this.backend.whenGET('/logout').respond(function(method, url, data, headers) {
            self.reset();

            return [200];
        });

        this.backend.whenGET(/\/projects$/).respond(function(method, url, data, headers) {
            return self.loggedIn ? [200, _.values(self.projects)] : 401;
        });

        this.backend.whenGET(/\/members$/).respond(function(method, url, data, headers) {
            return [200, []];
        });

        this.backend.whenPOST(/\/columns$/).respond(function(method, url, data, headers) {
            return [200, data];
        });

        this.backend.whenPUT(/\/columns/).respond(function(method, url, data, headers) {
            return [200, data];
        });

        this.backend.whenGET(/\/columns$/).respond(function(method, url, data, headers) {
            var parts = url.split('/'),
                namespace = parts[2],
                project = parts[3],
                path = namespace + '/' + project;

            if (!self.columns[path]) {
                return [404];
            }

            return [200, _.values(self.columns[path])];
        });

        this.backend.whenGET(/\/issues$/).respond(function(method, url, data, headers) {
            var parts = url.split('/'),
                namespace = parts[2],
                project = parts[3],
                path = namespace + '/' + project;

            if (!self.issues[path]) {
                return [404];
            }

            return [200, _.values(self.issues[path])];
        });

        this.backend.whenGET(/\/issues\//).respond(function(method, url, data, headers) {
            var parts = url.split('/'),
                namespace = parts[2],
                project = parts[3],
                iid = parts[4],
                path = namespace + '/' + project;

            if (!self.projects[path]) {
                return [404];
            }

            if (!self.issues[path][iid]) {
                return [404];
            }

            return [200, self.issues[path][iid]];
        });

        this.backend.whenGET(/\/projects\//).respond(function(method, url, data, headers) {
            var parts = url.split('/'),
                namespace = parts[2],
                project = parts[3],
                path = namespace + '/' + project;

            if (!self.projects[path]) {
                return [404];
            }

            return [200, self.projects[path]];
        });

        this.reset();
    },

    addUser: function(token, username, email, name) {
        this.users[token] = {
            username: username,
            email: email,
            name: (name || username)
        };
    },

    addProject: function(namespace, name) {
        this.projects[namespace + '/' + name] = {
            path_with_namespace: namespace + '/' + name
        };

        this.columns[namespace + '/' + name] = [];
        this.issues[namespace + '/' + name] = [];
    },

    addColumn: function(project, name) {
        if (!this.projects[project]) {
            this.addProject(project.split('/')[0], project.split('/')[1]);
        }

        this.columns[project][name] = {
            title: name,
            position: this.columns[project].length
        };
    },

    addIssue: function(project, iid, name) {
        if (!this.projects[project]) {
            this.addProject(project.split('/')[0], project.split('/')[1]);
        }

        this.issues[project][iid] = {
            id: iid,
            iid: iid,
            title: name,
            created_at: Date.now().toLocaleString(),
            author: {
                name: 'foo',
                email: 'foo@bar.com'
            },
            assignee: null,
            milestone: null,
            theme: null,
            column: null
        };
    },

    addIssueToColumn: function(project, iid, column) {
        this.issues[project][iid].column = column.toLowerCase();
    },

    setAccessLevel: function(project, role) {
        var levels = {
            guest: 10,
            reporter: 20,
            developer: 30,
            master: 40,
            owner: 50
        };

        if (!this.projects[project]) {
            this.addProject(project.split('/')[0], project.split('/')[1]);
        }

        this.projects[project].access_level = levels[role];
    }
};

angular.module('laboard-frontend-e2e', ['laboard-frontend', 'ngMockE2E'])
    .run(function ($httpBackend) {
        mock.setBackend($httpBackend);

        /*mock.addUser('foobar', 'test');
        mock.addProject('foo', 'bar');
        mock.addColumn('foo/bar', 'Sandbox');
        mock.addColumn('foo/bar', 'Todo');
        mock.addIssue('foo/bar', 42, 'Foobar');
        mock.addIssue('foo/bar', 1337, 'Foobar');
        mock.addIssueToColumn('foo/bar', 42, 'Sandbox');
        mock.addIssueToColumn('foo/bar', 1337, 'Todo');
        mock.setAccessLevel('foo/bar', 'master');*/
    });
