describe('module: column', function() {
    beforeEach(module('laboard-frontend'));

    var createController,
        $scope;

    beforeEach(inject(function ($rootScope, $controller) {
        $scope = $rootScope.$new();
        $scope.column = {
            title: 'foo',
            position: 0,
            closable: false,
            theme: 'info',
            limit: 0
        };

        createController = function() {
            return $controller('ColumnController', { '$scope': $scope });
        };
    }));

    describe('controller: ColumnController', function() {
        describe('drag\'n drop', function() {
            it('should accept drop if user is developer', inject(function (AuthorizationFactory) {
                spyOn(AuthorizationFactory, 'authorize').and.returnValue(true);

                createController();

                expect($scope.droppable).toBe(true);
            }));

            it('should not accept drop if user is not developer', inject(function (AuthorizationFactory) {
                spyOn(AuthorizationFactory, 'authorize').and.returnValue(false);

                createController();

                expect($scope.droppable).toBe(false);
            }));
        });

        describe('move', function() {
            it('should not move left if first column', inject(function ($q, AuthorizationFactory, ColumnsRepository) {
                var deferred = $q.defer();

                spyOn(ColumnsRepository, 'move').and.returnValue(deferred.promise);
                createController();

                $scope.move(-1);

                expect(ColumnsRepository.move).not.toHaveBeenCalled()
            }));

            it('should move left', inject(function ($q, AuthorizationFactory, ColumnsRepository) {
                var deferred = $q.defer();

                spyOn(ColumnsRepository, 'move').and.returnValue(deferred.promise);
                createController();
                $scope.column.position = 1;

                $scope.move(-1);

                expect(ColumnsRepository.move).toHaveBeenCalledWith(jasmine.objectContaining({
                    position: 0
                }));
            }));

            it('should move right', inject(function ($q, AuthorizationFactory, ColumnsRepository) {
                var deferred = $q.defer();

                spyOn(ColumnsRepository, 'move').and.returnValue(deferred.promise);
                createController();

                $scope.move(1);

                expect(ColumnsRepository.move).toHaveBeenCalledWith(jasmine.objectContaining({
                    position: 1
                }));
            }));
        });
    });
});
