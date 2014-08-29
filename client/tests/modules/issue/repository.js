describe('module: issue', function() {
    beforeEach(module('laboard-frontend'));

    describe('factory: IssuesRepository', function() {
        it("should be empty", inject(function(IssuesRepository) {
            expect(IssuesRepository.$objects).toBeNull();
        }));

        it("should store issue objects", inject(function(IssuesRepository) {
            var issue = {
                id: 42,
                title: 'foo'
            };

            IssuesRepository.add(issue);

            expect(IssuesRepository.$objects).toContain(issue);
        }));

        it("should update issue based on its id", inject(function(IssuesRepository) {
            var issue = {
                id: 42,
                title: 'foo'
            };

            IssuesRepository.add(issue);

            expect(IssuesRepository.$objects[0]).toBe(issue);

            var issueUpdated = {
                id: 42,
                title: 'foo',
                theme: 'success'
            };

            IssuesRepository.add(issueUpdated);

            expect(IssuesRepository.$objects[0]).toBe(issueUpdated);
        }));

        it("should be clearable", inject(function(IssuesRepository) {
            IssuesRepository.add({ id: 42, title: 'issue' });
            IssuesRepository.add({ id: 1337, title: 'otherIssue' });

            expect(IssuesRepository.$objects.length).toBe(2);

            IssuesRepository.clear();

            expect(IssuesRepository.$objects).toBeNull();
        }));

        it("should allow removing issue", inject(function(IssuesRepository) {
            var issue = { id: 42, title: 'issue' };

            IssuesRepository.add(issue);
            IssuesRepository.add({ id: 1337, title: 'otherIssue' });

            expect(IssuesRepository.$objects.length).toBe(2);
            expect(IssuesRepository.$objects).toContain(issue);

            IssuesRepository.unadd(issue);

            expect(IssuesRepository.$objects.length).toBe(1);
            expect(IssuesRepository.$objects).not.toContain(issue);
        }));

        describe('API', function() {
            beforeEach(inject(function($httpBackend, $rootScope) {
                $httpBackend.whenGET('/login/check').respond({});
                $httpBackend.whenGET(/partials/).respond('');

                $rootScope.project = {
                    path_with_namespace: 'foo/bar'
                };
            }));

            afterEach(inject(function($httpBackend) {
                $httpBackend.verifyNoOutstandingExpectation();
                $httpBackend.verifyNoOutstandingRequest();
            }));

            describe('GET', function() {
                it("should fetch all issues", inject(function($httpBackend, IssuesRepository) {
                    var issues = [
                        {
                            id: 42,
                            title: 'foo',
                            theme: 'success'
                        },
                        {
                            id: 1337,
                            title: 'foo',
                            theme: 'success'
                        }
                    ];

                    $httpBackend.expectGET('/projects/foo/bar/issues').respond(issues);

                    IssuesRepository.all();

                    $httpBackend.flush();
                    expect(IssuesRepository.$objects).toContain(jasmine.objectContaining(issues[0]));
                    expect(IssuesRepository.$objects).toContain(jasmine.objectContaining(issues[1]));
                }));

                it("should fetch one issue", inject(function($httpBackend, IssuesRepository) {
                    var issue = {
                        id: 42,
                        title: 'foo',
                        theme: 'success'
                    };

                    spyOn(IssuesRepository, 'add').and.callThrough();
                    $httpBackend.expectGET('/projects/foo/bar/issues/42').respond(issue);

                    IssuesRepository.one(42);

                    $httpBackend.flush();
                    expect(IssuesRepository.$objects).toContain(jasmine.objectContaining(issue));
                    expect(IssuesRepository.add).toHaveBeenCalledWith(jasmine.objectContaining(issue));
                }));
            });

            describe('PUT', function() {
                it("should persist issues", inject(function ($httpBackend, IssuesRepository) {
                    var issue = {
                        id: 42,
                        title: 'foo',
                        theme: 'success'
                    };

                    spyOn(IssuesRepository, 'add');
                    $httpBackend.expectPUT('/projects/foo/bar/issues').respond(issue);

                    IssuesRepository.persist(issue);

                    $httpBackend.flush();
                    expect(IssuesRepository.add).toHaveBeenCalledWith(jasmine.objectContaining(issue));
                }));

                it("should move issues", inject(function ($httpBackend, IssuesRepository) {
                    var issue = {
                        iid: 42,
                        title: 'foo',
                        theme: 'success'
                    };

                    spyOn(IssuesRepository, 'add').and.callThrough();
                    $httpBackend.expectPUT('/projects/foo/bar/issues/42/move').respond(issue);

                    IssuesRepository.move(issue);

                    $httpBackend.flush();
                    expect(IssuesRepository.add).toHaveBeenCalledWith(jasmine.objectContaining(issue));
                }));

                it("should update issues' theme", inject(function ($httpBackend, IssuesRepository) {
                    var issue = {
                        iid: 42,
                        title: 'foo',
                        theme: 'success'
                    };

                    spyOn(IssuesRepository, 'add').and.callThrough();
                    $httpBackend.expectPUT('/projects/foo/bar/issues/42/theme').respond(issue);

                    IssuesRepository.theme(issue);

                    $httpBackend.flush();
                    expect(IssuesRepository.add).toHaveBeenCalledWith(jasmine.objectContaining(issue));
                }));

                it("should close issues", inject(function ($httpBackend, IssuesRepository) {
                    var issue = {
                        iid: 42,
                        title: 'foo',
                        theme: 'success'
                    };

                    spyOn(IssuesRepository, 'unadd').and.callThrough();
                    $httpBackend.expectPUT('/projects/foo/bar/issues/42/close').respond(issue);
                    IssuesRepository.add(issue);

                    IssuesRepository.close(issue);

                    $httpBackend.flush();
                    expect(IssuesRepository.unadd).toHaveBeenCalledWith(jasmine.objectContaining(issue));
                }));
            });
        });
    });
});
