describe('module: issue', function() {
    beforeEach(module('laboard-frontend'));

    beforeEach(function () {
        module(function ($provide) {
            $provide.decorator('SocketFactory', function ($delegate) {
                spyOn($delegate, 'on').and.callThrough();

                return $delegate;
            });
        });
    });

    describe('factory: IssuesSocket', function() {
        it('should register prefixed event handlers', inject(function (SocketFactory, IssuesSocket) {
            IssuesSocket.on('event', angular.noop);

            expect(SocketFactory.on).toHaveBeenCalledWith('issue.event', jasmine.any(Function));
        }));
    });
});
