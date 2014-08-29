describe('module: project', function() {
    beforeEach(module('laboard-frontend'));

    var deferred;

    beforeEach(inject(function($q, ProjectsRepository, $httpBackend) {
        $httpBackend.whenGET('/login/check').respond({});
        $httpBackend.whenGET(/partials/).respond('');

        deferred = $q.defer();
        spyOn(ProjectsRepository, 'one').and.returnValue(deferred.promise);
    }));

    describe('factory: ProjectManager', function() {
        it('should select project', inject(function($q, $rootScope, ProjectsRepository, ColumnsRepository, IssuesRepository, ProjectManager) {
            var project = {
                    path_with_namespace: 'foo/bar'
                };

            spyOn(IssuesRepository, 'clear').and.callThrough();
            spyOn(ColumnsRepository, 'clear').and.callThrough();

            ProjectManager.select(project.path_with_namespace)
                .then(function() {
                    expect($rootScope.project).toBe(project);
                    expect(IssuesRepository.clear).toHaveBeenCalled();
                    expect(ColumnsRepository.clear).toHaveBeenCalled();
                });
            deferred.resolve(project);
            $rootScope.$apply();

            expect(ProjectsRepository.one).toHaveBeenCalledWith(project.path_with_namespace);
        }));

        it('should switch project', inject(function($q, $rootScope, ProjectsRepository, ColumnsRepository, IssuesRepository, ProjectManager) {
            var project = {
                path_with_namespace: 'foo/bar'
            };

            spyOn(IssuesRepository, 'clear').and.callThrough();
            spyOn(ColumnsRepository, 'clear').and.callThrough();
            $rootScope.project = {
                path_with_namespace: 'bar/foo'
            };

            ProjectManager.select(project.path_with_namespace)
                .then(function() {
                    expect($rootScope.project).toBe(project);
                    expect(IssuesRepository.clear).toHaveBeenCalled();
                    expect(ColumnsRepository.clear).toHaveBeenCalled();
                });
            deferred.resolve(project);
            $rootScope.$apply();

            expect(ProjectsRepository.one).toHaveBeenCalledWith(project.path_with_namespace);
        }));

        it('should not switch to same project', inject(function($q, $rootScope, ProjectsRepository, ColumnsRepository, IssuesRepository, ProjectManager) {
            var project = {
                path_with_namespace: 'foo/bar'
            };

            spyOn(IssuesRepository, 'clear').and.callThrough();
            spyOn(ColumnsRepository, 'clear').and.callThrough();
            $rootScope.project = project;

            ProjectManager.select(project.path_with_namespace)
                .then(function() {
                    expect($rootScope.project).toBe(project);
                    expect(IssuesRepository.clear).not.toHaveBeenCalled();
                    expect(ColumnsRepository.clear).not.toHaveBeenCalled();
                });
            deferred.resolve(project);
            $rootScope.$apply();

            expect(ProjectsRepository.one).not.toHaveBeenCalledWith(project.path_with_namespace);
        }));
    });
});
