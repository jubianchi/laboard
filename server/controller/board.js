var _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    request = require('request');

module.exports = function(router, authenticated, application) {
    router.get('/projects/:ns/:name/columns',
        authenticated,
        function(req, res) {
            var file = application.config.data_dir + '/' + req.params.ns + '_' + req.params.name + '.json',
                columns = [];

            if (fs.existsSync(file)) {
                columns = JSON.parse(fs.readFileSync(file));
            }

            res.response.ok(_.values(columns));
        }
    );

    router.post('/projects/:ns/:name/columns',
        authenticated,
        function(req, res) {
            var file = application.config.data_dir + '/' + req.params.ns + '_' + req.params.name + '.json',
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

                res.response.created(column);
            } else {
                res.error.conflict({
                    message: 'Conflict'
                });
            }
        }
    );

    router.put('/projects/:ns/:name/columns',
        authenticated,
        function(req, res) {
            var file = application.config.data_dir + '/' + req.params.ns + '_' + req.params.name + '.json',
                column = req.body,
                columns = {};

            if (fs.existsSync(file)) {
                columns = JSON.parse(fs.readFileSync(file));
            }

            if (columns[column.title]) {
                if (typeof column.theme !== "undefined") columns[column.title].theme = column.theme;
                if (typeof column.position !== "undefined") columns[column.title].position = column.position;
                if (typeof column.closable !== "undefined") columns[column.title].closable = !!column.closable;

                fs.writeFileSync(file, JSON.stringify(columns));

                res.response.ok(column);
            } else {
                res.error.notFound({
                    message: 'Not found'
                });
            }
        }
    );

    router.delete('/projects/:ns/:name/columns',
        authenticated,
        function(req, res) {
            var file = application.config.data_dir + '/' + req.params.ns + '_' + req.params.name + '.json',
                column = req.body,
                columns = {};

            if (fs.existsSync(file)) {
                columns = JSON.parse(fs.readFileSync(file));
            }

            if (columns[column.title]) {
                var col = columns[column.title];

                delete columns[column.title];

                fs.writeFileSync(file, JSON.stringify(columns));

                res.response.ok(col);
            } else {
                res.error.notFound({
                    message: 'Not found'
                });
            }
        }
    );
};
