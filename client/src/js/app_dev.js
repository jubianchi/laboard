var mock = {
    reset: function() {
        this.users = [];
        this.projects = [];
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

        this.backend.whenGET('/projects').respond(function(method, url, data, headers) {
            return self.loggedIn ? [200, _.values(self.projects)] : 401;
        });

        this.backend.whenGET(/\/members$/).respond(function(method, url, data, headers) {
            return [200, []];
        });

        this.backend.whenGET(/\/issues$/).respond(function(method, url, data, headers) {
            var parts = url.split('/'),
                namespace = parts[2],
                project = parts[3],
                path = namespace + '/' + project;

            if (!self.projects[path]) {
                return [404];
            }

            return [200, self.issues[path]];
        });

        this.backend.whenGET(/\/columns$/).respond(function(method, url, data, headers) {
            console.log(url);
            var parts = url.split('/'),
                namespace = parts[2],
                project = parts[3],
                path = namespace + '/' + project;

            if (!self.projects[path]) {
                return [404];
            }

            return [200, self.columns[path]];
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
            name: name
        };
    },

    addProject: function(namespace, name) {
        this.projects[namespace + '/' + name] = {
            path_with_namespace: namespace + '/' + name
        };

        this.columns[namespace + '/' + name] = [];
        this.issues[namespace + '/' + name] = [];
    }
};

angular.module('laboard-frontend-e2e', ['laboard-frontend', 'ngMockE2E'])
    .run(function ($httpBackend) {
        mock.setBackend($httpBackend);

        //mock.addUser('foo', 'bar');
        //mock.addProject('foo', 'bar');
    });
