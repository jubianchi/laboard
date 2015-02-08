describe('factory: SocketFactory', function() {
    beforeEach(module('laboard-frontend'));

    var mockSocket = {
            on: angular.noop
        },
        mockSocketIo = {
            connect: function() {
                return mockSocket
            }
        },
        mockWindow = {
            io: mockSocketIo
        };

    beforeEach(function() {
        module(function($provide) {
            $provide.value('$window', mockWindow);

            $provide.decorator('$location', function($delegate) {
                spyOn($delegate, 'protocol').and.returnValue('http');
                spyOn($delegate, 'host').and.returnValue('laboard');
                spyOn($delegate, 'port').and.returnValue(42);

                return $delegate;
            });
        });
    });

    describe('without configuration option', function() {
        it('should connect to websocket server using location port', inject(function(SocketFactory) {
            spyOn(mockWindow.io, 'connect').and.callThrough();

            SocketFactory.connect();

            expect(mockWindow.io.connect).toHaveBeenCalledWith('http://laboard:42');
        }));
    });

    it('should register connect handler', inject(function(SocketFactory) {
        spyOn(mockSocket, 'on').and.callThrough();

        SocketFactory.connect();

        expect(mockSocket.on).toHaveBeenCalledWith('connect', jasmine.any(Function));
    }));

    it('should broadcast ready event when connected', inject(function($rootScope, SocketFactory) {
        var connectHandler = angular.noop;

        mockSocket.on = function(e, h) {
            connectHandler = h;
        };

        spyOn($rootScope, '$broadcast').and.callThrough();
        SocketFactory.connect();
        connectHandler();

        expect($rootScope.$broadcast).toHaveBeenCalledWith('socket.ready', mockSocket);
    }));

    it('should register queued handlers on connect', inject(function($rootScope, SocketFactory) {
        var connectHandler = angular.noop;

        mockSocket.on = function(e, h) {
            if (e === 'connect') {
                connectHandler = h;
            }
        };

        spyOn(mockSocket, 'on').and.callThrough();
        SocketFactory.connect();
        SocketFactory.on('event', angular.noop);
        SocketFactory.on('otherEvent', angular.noop);

        expect(mockSocket.on).not.toHaveBeenCalledWith('event', jasmine.any(Function));
        expect(mockSocket.on).not.toHaveBeenCalledWith('otherEvent', jasmine.any(Function));

        connectHandler();

        expect(mockSocket.on).toHaveBeenCalledWith('event', jasmine.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith('otherEvent', jasmine.any(Function));
    }));

    it('should directly register handlers if already connected', inject(function($rootScope, SocketFactory) {
        var connectHandler = angular.noop;

        mockSocket.on = function(e, h) {
            if (e === 'connect') {
                connectHandler = h;
            }
        };

        spyOn(mockSocket, 'on').and.callThrough();
        SocketFactory.connect();
        connectHandler();
        SocketFactory.on('event', angular.noop);
        SocketFactory.on('otherEvent', angular.noop);

        expect(mockSocket.on).toHaveBeenCalledWith('event', jasmine.any(Function));
        expect(mockSocket.on).toHaveBeenCalledWith('otherEvent', jasmine.any(Function));
    }));
});
