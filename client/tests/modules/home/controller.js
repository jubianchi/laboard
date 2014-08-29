describe('module: home', function() {
    beforeEach(module('laboard-frontend'));

    var createController,
        $scope;

    beforeEach(inject(function ($rootScope, $controller, $httpBackend) {
        $scope = $rootScope.$new();

        $httpBackend.whenGET('/login/check').respond({});
        $httpBackend.whenGET('/projects').respond([]);
        $httpBackend.whenGET(/partials/).respond('');

        createController = function() {
            return $controller('HomeController', { '$scope': $scope });
        };
    }));

    describe('controller: HomeController', function() {
        it('should load user\'s projects', inject(function($rootScope, $q, ProjectsRepository) {
            var deferred = $q.defer();

            spyOn(ProjectsRepository, 'all').and.returnValue(deferred.promise);

            createController();

            expect(ProjectsRepository.all).toHaveBeenCalled();
        }));

        it('should ask to select project', inject(function($rootScope, $q, $state, ProjectManager) {
            var deferred = $q.defer(),
                project = {
                    path_with_namespace: 'foo/bar'
                };

            spyOn($state, 'is').and.returnValue(true);
            spyOn($state, 'transitionTo').and.callThrough();
            spyOn(ProjectManager, 'prompt').and.returnValue(deferred.promise);

            createController();
            deferred.resolve(project);
            $rootScope.$apply();

            expect(ProjectManager.prompt).toHaveBeenCalled();
            expect($state.transitionTo).toHaveBeenCalledWith('home.project', { namespace: 'foo', project: 'bar'});
        }));
    });
});
