var _ = require('lodash'),
    fs = require('fs');

module.exports = function(router, container) {
    var config = container.get('config');

    router.authenticated.get('/projects/:ns/:name/columns',
        function(req, res) {
            var file = config.data_dir + '/' + req.params.ns + '_' + req.params.name + '.json',
                columns = [];

            if (fs.existsSync(file)) {
                columns = JSON.parse(fs.readFileSync(file));
            }

            res.response.ok(_.values(columns));
        }
    );

    router.authenticated.post('/projects/:ns/:name/columns',
        function(req, res) {
            var file = config.data_dir + '/' + req.params.ns + '_' + req.params.name + '.json',
                column = req.body,
                columns = {};

            if (fs.existsSync(file)) {
                columns = JSON.parse(fs.readFileSync(file));
            }

            if (!columns[column.title]) {
                columns[column.title] = {
                    title: column.title,
                    closable: !!column.closable,
                    position: column.position || 0,
                    theme: column.theme || 'default'
                };

                fs.writeFileSync(file, JSON.stringify(columns));

                container.get('socket').sockets.emit(
                    'column.new',
                    {
                        namespace: req.params.ns,
                        project: req.params.name,
                        column: columns[column.title]
                    }
                );

                res.response.created(column);
            } else {
                res.error.conflict({
                    message: 'Conflict'
                });
            }
        }
    );

    router.authenticated.put('/projects/:ns/:name/columns',
        function(req, res) {
            var file = config.data_dir + '/' + req.params.ns + '_' + req.params.name + '.json',
                column = req.body,
                columns = {};

            if (fs.existsSync(file)) {
                columns = JSON.parse(fs.readFileSync(file));
            }

            if (columns[column.title]) {
                if (typeof column.theme !== "undefined") columns[column.title].theme = column.theme;
                if (typeof column.position !== "undefined") columns[column.title].position = column.position;
                if (typeof column.closable !== "undefined") columns[column.title].closable = column.closable;

                fs.writeFileSync(file, JSON.stringify(columns));

                container.get('socket').sockets.emit(
                    'column.edit',
                    {
                        namespace: req.params.ns,
                        project: req.params.name,
                        column: columns[column.title]
                    }
                );

                res.response.ok(column);
            } else {
                res.error.notFound({
                    message: 'Not found'
                });
            }
        }
    );

    router.authenticated.put('/projects/:ns/:name/columns/:id/move',
        function(req, res) {
            var file = config.data_dir + '/' + req.params.ns + '_' + req.params.name + '.json',
                columns = JSON.parse(fs.readFileSync(file)),
                from = columns[req.params.id].position,
                to =  req.body.position;


            if (typeof req.body.position === 'undefined') {
                res.error.notAcceptable({
                    message: 'Not acceptable'
                });
            } else {
                columns[req.params.id].position = to;

                fs.writeFileSync(file, JSON.stringify(columns));

                container.get('socket').sockets.emit(
                    'column.move',
                    {
                        namespace: req.params.ns,
                        project: req.params.name,
                        from: from,
                        to: to,
                        column: columns[req.params.id]
                    }
                );

                res.response.ok(columns[req.params.id]);
            }
        }
    );

    router.authenticated.delete('/projects/:ns/:name/columns',
        function(req, res) {
            var file = config.data_dir + '/' + req.params.ns + '_' + req.params.name + '.json',
                column = req.body,
                columns = {};

            if (fs.existsSync(file)) {
                columns = JSON.parse(fs.readFileSync(file));
            }

            if (columns[column.title]) {
                var col = columns[column.title];

                delete columns[column.title];

                fs.writeFileSync(file, JSON.stringify(columns));

                container.get('socket').sockets.emit(
                    'column.remove',
                    {
                        namespace: req.params.ns,
                        project: req.params.name,
                        column: col
                    }
                );

                res.response.ok(col);
            } else {
                res.error.notFound({
                    message: 'Not found'
                });
            }
        }
    );
};
