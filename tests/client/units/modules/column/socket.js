describe('module: column', function() {
    beforeEach(module('laboard-frontend'));

    beforeEach(function () {
        module(function ($provide) {
            $provide.decorator('SocketFactory', function ($delegate) {
                spyOn($delegate, 'on').and.callThrough();

                return $delegate;
            });
        });
    });

    describe('factory: ColumnsSocket', function() {
        it('should register prefixed event handlers', inject(function (SocketFactory, ColumnsSocket) {
            ColumnsSocket.on('event', angular.noop);

            expect(SocketFactory.on).toHaveBeenCalledWith('column.event', jasmine.any(Function));
        }));
    });
});
