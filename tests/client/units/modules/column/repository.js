describe('module: column', function() {
    beforeEach(module('laboard-frontend'));

    describe('factory: ColumnsRepository', function() {
        it("should be empty", inject(function(ColumnsRepository) {
            expect(ColumnsRepository.$objects).toBeNull();
        }));

        it("should store column objects", inject(function(ColumnsRepository) {
            var column = {
                title: 'foo'
            };

            ColumnsRepository.add(column);

            expect(ColumnsRepository.$objects).toContain(column);
        }));

        it("should set column default attributes", inject(function(ColumnsRepository) {
            var column = {
                title: 'foo'
            };

            ColumnsRepository.add(column);

            expect(column.position).toBe(0);
            expect(column.theme).toBe('default');
            expect(column.closable).toBe(false);
            expect(column.issues.length).toBe(0);
        }));

        it("should update column based on its name", inject(function(ColumnsRepository) {
            var column = {
                title: 'foo'
            };

            ColumnsRepository.add(column);

            expect(ColumnsRepository.$objects[0]).toBe(column);

            var columnUpdated = {
                title: 'foo',
                theme: 'success'
            };

            ColumnsRepository.add(columnUpdated);

            expect(ColumnsRepository.$objects[0]).toBe(columnUpdated);
        }));

        it("should be clearable", inject(function(ColumnsRepository) {
            ColumnsRepository.add({ title: 'column' });
            ColumnsRepository.add({ title: 'otherColumn' });

            expect(ColumnsRepository.$objects.length).toBe(2);

            ColumnsRepository.clear();

            expect(ColumnsRepository.$objects).toBeNull();
        }));

        it("should allow removing column", inject(function(ColumnsRepository) {
            var column = { title: 'column' };

            ColumnsRepository.add(column);
            ColumnsRepository.add({ title: 'otherColumn' });

            expect(ColumnsRepository.$objects.length).toBe(2);
            expect(ColumnsRepository.$objects).toContain(column);

            ColumnsRepository.unadd(column);

            expect(ColumnsRepository.$objects.length).toBe(1);
            expect(ColumnsRepository.$objects).not.toContain(column);
        }));

        describe('API', function() {
            beforeEach(inject(function ($httpBackend, $rootScope) {
                $httpBackend.whenGET('/login/check').respond({});
                $httpBackend.whenGET(/partials/).respond('');

                $rootScope.project = {
                    path_with_namespace: 'foo/bar'
                };
            }));

            afterEach(inject(function ($httpBackend) {
                $httpBackend.verifyNoOutstandingExpectation();
                $httpBackend.verifyNoOutstandingRequest();
            }));

            describe('GET', function() {
                it("should fetch all columns", inject(function($httpBackend, ColumnsRepository) {
                    var columns = [
                        {
                            title: 'Foo',
                            closable: false,
                            position: 0,
                            theme: 'default',
                            limit: 0
                        },
                        {
                            title: 'Bar',
                            closable: false,
                            position: 1,
                            theme: 'default',
                            limit: 0
                        }
                    ];

                    $httpBackend.expectGET('/projects/foo/bar/columns').respond(columns);

                    ColumnsRepository.all();

                    $httpBackend.flush();
                    expect(ColumnsRepository.$objects).toContain(jasmine.objectContaining(columns[0]));
                    expect(ColumnsRepository.$objects).toContain(jasmine.objectContaining(columns[1]));
                }));

                it("should sort fetched columns", inject(function($httpBackend, ColumnsRepository) {
                    var columns = [
                        {
                            title: 'Foo',
                            closable: false,
                            position: 1,
                            theme: 'default',
                            limit: 0
                        },
                        {
                            title: 'Bar',
                            closable: false,
                            position: 0,
                            theme: 'default',
                            limit: 0
                        }
                    ];

                    $httpBackend.expectGET('/projects/foo/bar/columns').respond(columns);

                    ColumnsRepository.all();

                    $httpBackend.flush();
                    expect(ColumnsRepository.$objects[1]).toEqual(jasmine.objectContaining(columns[0]));
                    expect(ColumnsRepository.$objects[0]).toEqual(jasmine.objectContaining(columns[1]));
                }));

                it("should fetch one column", inject(function($httpBackend, ColumnsRepository) {
                    var column = {
                        title: 'Foo',
                        closable: false,
                        position: 0,
                        theme: 'default',
                        limit: 0
                    };

                    spyOn(ColumnsRepository, 'add').and.callThrough();
                    $httpBackend.expectGET('/projects/foo/bar/columns/foo').respond(column);

                    ColumnsRepository.one('foo');

                    $httpBackend.flush();
                    expect(ColumnsRepository.add).toHaveBeenCalledWith(jasmine.objectContaining(column));
                }));
            });

            describe('POST', function() {
                it("should persist columns", inject(function ($httpBackend, ColumnsRepository) {
                    var column = {
                        title: 'Foo',
                        closable: false,
                        position: 0,
                        theme: 'default',
                        limit: 0
                    };

                    spyOn(ColumnsRepository, 'add');
                    $httpBackend.expectPOST('/projects/foo/bar/columns').respond(column);

                    ColumnsRepository.persist(column);

                    $httpBackend.flush();
                    expect(ColumnsRepository.add).toHaveBeenCalledWith(jasmine.objectContaining(column));
                }));
            });

            describe('PUT', function() {
                it("should update columns", inject(function ($httpBackend, ColumnsRepository) {
                    var column = {
                        title: 'Foo',
                        closable: false,
                        position: 0,
                        theme: 'default',
                        limit: 0
                    };

                    spyOn(ColumnsRepository, 'add');
                    $httpBackend.expectPOST('/projects/foo/bar/columns').respond(400);
                    $httpBackend.expectPUT('/projects/foo/bar/columns/Foo').respond(column);

                    ColumnsRepository.persist(column);

                    $httpBackend.flush();
                    expect(ColumnsRepository.add).toHaveBeenCalledWith(jasmine.objectContaining(column));
                }));

                it("should move columns", inject(function ($httpBackend, ColumnsRepository) {
                    var column = {
                        title: 'Foo',
                        closable: false,
                        position: 2,
                        theme: 'default',
                        limit: 0
                    };

                    spyOn(ColumnsRepository, 'add').and.callThrough();
                    $httpBackend.expectPUT('/projects/foo/bar/columns/Foo/move').respond(column);

                    ColumnsRepository.move(column);

                    $httpBackend.flush();
                    expect(ColumnsRepository.add).toHaveBeenCalledWith(jasmine.objectContaining(column));
                }));
            });

            describe('DELETE', function() {
                it("should delete columns", inject(function ($httpBackend, ColumnsRepository) {
                    var column = {
                        title: 'Foo',
                        closable: false,
                        position: 2,
                        theme: 'default',
                        limit: 0
                    };

                    spyOn(ColumnsRepository, 'unadd').and.callThrough();
                    $httpBackend.expectDELETE('/projects/foo/bar/columns/Foo').respond(column);
                    ColumnsRepository.add(column);

                    ColumnsRepository.remove(column);

                    $httpBackend.flush();
                    expect(ColumnsRepository.unadd).toHaveBeenCalledWith(jasmine.objectContaining(column));
                }));
            });
        });
    });
});
