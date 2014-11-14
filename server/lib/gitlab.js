var gitlab = module.exports = function gitlab(url, http) {
    this.base = url;
    this.http = http;
};

gitlab.prototype = {
    login: function(username, password, req, done) {
        if (typeof req === 'function') {
            done = req;
            req = null;
        }

        this.http(
            {
                method: 'POST',
                uri: this.base + '/session',
                body: JSON.stringify({
                    login: username,
                    password: password
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            },
            function(err, resp, body) {
                if (err) {
                    done(err);

                    return;
                }

                if (resp.statusCode !== 201) {
                    if (req) {
                        req.res.status(resp.statusCode);
                    }

                    try {
                        done(JSON.parse(body));
                    } catch(e) {
                        done({
                            status: resp.statusCode
                        });
                    }

                    return;
                }

                done(null, JSON.parse(body));
            }
        )
    },
    auth: function(token, req, done) {
        if (typeof req === 'function') {
            done = req;
            req = null;
        }

        this.http.get(
            this.base + '/user?private_token=' + token,
            function (err, resp, body) {
                if (err) {
                    done(err);

                    return;
                }

                if (resp.statusCode !== 200) {
                    if (req) {
                        req.res.status(resp.statusCode);
                    }

                    try {
                        done(JSON.parse(body));
                    } catch(e) {
                        done({
                            status: resp.statusCode
                        });
                    }

                    return;
                }

                done(null, JSON.parse(body));
            }
        );
    },
    url: function(token, url, params) {
        var query = '',
            sep = '?';

        if (!params) {
            params = [];
        }

        params.private_token = token;

        Object.keys(params).forEach(function (key) {
            query += sep + key + '=' + params[key];
            sep = '&';
        });

        return this.base + url + query;
    },
    get: function(token, url, params, callback) {
        if (typeof params === "function") {
            callback = params;
            params = [];
        }

        return this.http.get(
            this.url(token, url, params),
            function (err, resp, body) {
                resp.links = {};

                if (resp.headers.link) {
                    resp.headers.link.split(',')
                        .filter(function(value) {
                            return /<([^>]+)>; rel="([^"]+)"/.test(value);
                        })
                        .map(function(value) {
                            var matches = /<([^>]+)>; rel="([^"]+)"/.exec(value);

                            return [matches[1], matches[2]];
                        })
                        .forEach(function(link) {
                            resp.links[link[1]] = link[0];
                        });
                }

                try {
                    body = JSON.parse(body);
                } catch (e) {}

                callback(err, resp, body);
            }
        );
    },
    put: function(token, url, body, params, callback) {
        if (typeof params === "function") {
            callback = params;
            params = [];
        }

        this.http(
            {
                method: 'PUT',
                uri: this.url(token, url, params),
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json'
                }
            },
            function(err, resp, body) {
                try {
                    body = JSON.parse(body);
                } catch (e) {}

                callback(err, resp, body);
            }
        );
    },
    post: function(token, url, body, params, callback) {
        if (typeof params === "function") {
            callback = params;
            params = [];
        }

        this.http(
            {
                method: 'POST',
                uri: this.url(token, url, params),
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json'
                }
            },
            function(err, resp, body) {
                try {
                    body = JSON.parse(body);
                } catch (e) {}

                callback(err, resp, body);
            }
        );
    }
};
