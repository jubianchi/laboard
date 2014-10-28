describe('module: issue', function() {
    beforeEach(module('laboard-frontend'));

    describe('filter: column', function() {
        it('has a search column', inject(function ($filter) {
            expect($filter('column')).not.toBeNull();
        }));

        it('should filter issues on column', inject(function ($filter) {
            var issues = [
                    {
                        id: 42,
                        column: 'foo'
                    },
                    {
                        id: 1337,
                        column: 'bar'
                    }
                ],
                column = {
                    title: 'foo'
                };

            expect($filter('column')(issues, { title: 'foo' }).length).toEqual(1);
            expect($filter('column')(issues, { title: 'Bar' }).length).toEqual(1);
            expect($filter('column')(issues, { title: 'baz' }).length).toEqual(0);
        }));
    });

    describe('filter: search', function() {
        it('has a search filter', inject(function($filter) {
            expect($filter('search')).not.toBeNull();
        }));

        it('should fallback to native filter', inject(function($filter) {
            var issues = [
                {
                    id: 42,
                    title: 'foo',
                    author: {
                        username: 'bar'
                    }
                },
                {
                    id: 1337,
                    title: 'baz'
                }
            ];

            expect($filter('search')(issues, 'ba').length).toEqual(2);
            expect($filter('search')(issues, 'baz').length).toEqual(1);
            expect($filter('search')(issues, 'foo').length).toEqual(1);
            expect($filter('search')(issues, 13).length).toEqual(1);
        }));

        describe('property: Milestone', function() {
            it('should filter on milestone\'s title property', inject(function($filter) {
                var issues = [
                    {
                        id: 42,
                        milestone: {
                            title: 'previous'
                        }
                    },
                    {
                        id: 1337,
                        milestone: {
                            title: 'next'
                        }
                    }
                ];

                expect($filter('search')(issues, ':ne').length).toEqual(1);
                expect($filter('search')(issues, ':next').length).toEqual(1);
                expect($filter('search')(issues, ':e').length).toEqual(2);
            }));
        });

        describe('property: Author', function() {
            it('should filter on author\'s username property', inject(function($filter) {
                var issues = [
                    {
                        id: 42,
                        author: {
                            username: 'john'
                        }
                    },
                    {
                        id: 1337,
                        author: {
                            username: 'jane'
                        }
                    }
                ];

                expect($filter('search')(issues, '@from jo').length).toEqual(1);
                expect($filter('search')(issues, '@from john').length).toEqual(1);
                expect($filter('search')(issues, '@from j').length).toEqual(2);
            }));

            it('should filter on author\'s name property', inject(function($filter) {
                var issues = [
                    {
                        id: 42,
                        author: {
                            name: 'John'
                        }
                    },
                    {
                        id: 1337,
                        author: {
                            name: 'Jane'
                        }
                    }
                ];

                expect($filter('search')(issues, '@from jo').length).toEqual(1);
                expect($filter('search')(issues, '@from John').length).toEqual(1);
                expect($filter('search')(issues, '@from j').length).toEqual(2);
                expect($filter('search')(issues, '@from J').length).toEqual(2);
            }));
        });

        describe('property: Assignee', function() {
            it('should filter on assignee\'s username property', inject(function($filter) {
                var issues = [
                    {
                        id: 42,
                        assignee: {
                            username: 'john'
                        }
                    },
                    {
                        id: 1337,
                        assignee: {
                            username: 'jane'
                        }
                    }
                ];

                expect($filter('search')(issues, '@to jo').length).toEqual(1);
                expect($filter('search')(issues, '@to john').length).toEqual(1);
                expect($filter('search')(issues, '@to j').length).toEqual(2);
            }));

            it('should filter on assignee\'s name property', inject(function($filter) {
                var issues = [
                    {
                        id: 42,
                        assignee: {
                            name: 'John'
                        }
                    },
                    {
                        id: 1337,
                        assignee: {
                            name: 'Jane'
                        }
                    }
                ];

                expect($filter('search')(issues, '@to jo').length).toEqual(1);
                expect($filter('search')(issues, '@to John').length).toEqual(1);
                expect($filter('search')(issues, '@to j').length).toEqual(2);
                expect($filter('search')(issues, '@to J').length).toEqual(2);
            }));
        });

        describe('property: Author & Assignee', function() {
            it('should filter on username property', inject(function($filter) {
                var issues = [
                    {
                        id: 42,
                        author: {
                            username: 'john'
                        }
                    },
                    {
                        id: 13,
                        author: {
                            username: 'jane'
                        }
                    },
                    {
                        id: 37,
                        assignee: {
                            username: 'jack'
                        }
                    },
                    {
                        id: 23,
                        assignee: {
                            username: 'mike'
                        }
                    }
                ];

                expect($filter('search')(issues, '@jo').length).toEqual(1);
                expect($filter('search')(issues, '@john').length).toEqual(1);
                expect($filter('search')(issues, '@ja').length).toEqual(2);
                expect($filter('search')(issues, '@m').length).toEqual(1);
            }));

            it('should filter on name property', inject(function($filter) {
                var issues = [
                    {
                        id: 42,
                        author: {
                            name: 'John'
                        }
                    },
                    {
                        id: 13,
                        author: {
                            name: 'Jane'
                        }
                    },
                    {
                        id: 37,
                        assignee: {
                            name: 'Jack'
                        }
                    },
                    {
                        id: 23,
                        assignee: {
                            name: 'Mike'
                        }
                    }
                ];

                expect($filter('search')(issues, '@jo').length).toEqual(1);
                expect($filter('search')(issues, '@John').length).toEqual(1);
                expect($filter('search')(issues, '@Ja').length).toEqual(2);
                expect($filter('search')(issues, '@J').length).toEqual(3);
            }));

            it('should filter user\'s own issues', inject(function($rootScope, $filter) {
                var issues = [
                    {
                        id: 42,
                        author: {
                            username: 'john'
                        }
                    },
                    {
                        id: 13,
                        author: {
                            username: 'jane'
                        }
                    },
                    {
                        id: 37,
                        assignee: {
                            username: 'jack'
                        }
                    },
                    {
                        id: 23,
                        assignee: {
                            username: 'mike'
                        }
                    }
                ];

                $rootScope.user = {
                    username: 'john'
                };

                expect($filter('search')(issues, '@me').length).toEqual(1);
            }));
        });

        describe('property: Number', function() {
            it('should filter on iid property', inject(function($filter) {
                var issues = [
                    {
                        id: 42,
                        iid: 13
                    },
                    {
                        id: 1337,
                        iid: 1337
                    }
                ];

                expect($filter('search')(issues, '#3').length).toEqual(0);
                expect($filter('search')(issues, '#42').length).toEqual(0);
                expect($filter('search')(issues, '#13').length).toEqual(2);
                expect($filter('search')(issues, '#1337').length).toEqual(1);
            }));
        });
    });
});
