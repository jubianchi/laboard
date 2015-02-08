(function(angular) {
    var transform = function(text, $root) {
        text = text.replace(/([^\s]+)\/([^\s]+)#(\d+)/, '<a class="reference" href="' + $root.gitlabUrl + '/$1/$2/issues/$3">$1/$2#$3</a>');
        text = text.replace(/([^\s]+)\/([^\s]+)!(\d+)/, '<a class="reference" href="' + $root.gitlabUrl + '/$1/$2/merge_requests/$3">$1/$2!$3</a>');

        text = text.replace(/#(\d+)(?!<\/a>)/, '<a class="reference" href="' + $root.gitlabUrl + '/' + $root.project.path_with_namespace + '/issues/$1">#$1</a>');
        text = text.replace(/!(\d+)(?!<\/a>)/, '<a class="reference" href="' + $root.gitlabUrl + '/' + $root.project.path_with_namespace + '/merge_requests/$1">!$1</a>');
        text = text.replace(/@([^\s]+)/, '<a class="reference" href="' + $root.gitlabUrl + '/u/$1">@$1</a>');

        return text;
    };

    angular.module('laboard-frontend')
        .filter('reference', [
            '$rootScope', '$sce',
            function($root, $sce) {
                return function(text) {
                    return $sce.trustAsHtml(transform(text, $root));
                };
            }
        ])
        .filter('referenceMarkdown', [
            '$rootScope', '$sce', 'marked',
            function($root, $sce, marked) {
                return function(text) {
                    return $sce.trustAsHtml(marked(transform(text, $root)));
                };
            }
        ]);
})(angular);
