describe('directive: counter', function() {
    beforeEach(module('laboard-frontend'));

    var scope, compile, element;

    beforeEach(inject(function($rootScope, $compile) {
        scope = $rootScope.$new();
        compile = $compile;
    }));

    describe('with only value', function() {
        it("should display the counter value", function() {
            element = compile('<counter value="5"></counter>')(scope);
            scope.$digest();

            expect(element.text()).toBe('5');
        });

        it("should display the counter bound value", function() {
            element = compile('<counter value="value"></counter>')(scope);
            scope.value = 0;
            scope.$digest();

            expect(element.text()).toBe('0');
        });
    });

    describe('with value and singular label', function() {
        describe('if value is 0', function() {
            it("should display the singular label", function() {
                element = compile('<counter value="0" singular="thing"></counter>')(scope);
                scope.$digest();

                expect(element.text()).toBe('0 thing');
            });

            it("using bindings should display the singular label", function() {
                element = compile('<counter value="value" singular="thing"></counter>')(scope);
                scope.value = 0;
                scope.$digest();

                expect(element.text()).toBe('0 thing');
            });
        });

        describe('if value is 1', function() {
            it("should display the singular label", function() {
                element = compile('<counter value="1" singular="thing"></counter>')(scope);
                scope.$digest();

                expect(element.text()).toBe('1 thing');
            });

            it("using bindings should display the singular label", function() {
                element = compile('<counter value="value" singular="thing"></counter>')(scope);
                scope.value = 1;
                scope.$digest();

                expect(element.text()).toBe('1 thing');
            });
        });

        describe('if value is greater than 1 and no plural label', function() {
            it("should display the singular label", function() {
                element = compile('<counter value="2" singular="thing(s)"></counter>')(scope);
                scope.$digest();

                expect(element.text()).toBe('2 thing(s)');
            });

            it("using bindings should display the singular label", function() {
                element = compile('<counter value="value" singular="thing(s)"></counter>')(scope);
                scope.value = 2;
                scope.$digest();

                expect(element.text()).toBe('2 thing(s)');
            });
        });
    });

    describe('with value, singular label and plural label', function() {
        describe('if value is greater than 1', function() {
            it("should display the singular label", function() {
                element = compile('<counter value="2" singular="thing" plural="things"></counter>')(scope);
                scope.$digest();

                expect(element.text()).toBe('2 things');
            });

            it("using bindings should display the singular label", function() {
                element = compile('<counter value="value" singular="thing" plural="things"></counter>')(scope);
                scope.value = 2;
                scope.$digest();

                expect(element.text()).toBe('2 things');
            });
        });
    });

    describe('with max value', function() {
        it("should display the maximum value", function() {
            element = compile('<counter value="2" max="5"></counter>')(scope);
            scope.$digest();

            expect(element.text()).toBe('2 / 5');
        });

        it("using bindings should display the maximum value", function() {
            element = compile('<counter value="value" max="max"></counter>')(scope);
            scope.value = 2;
            scope.max = 5;
            scope.$digest();

            expect(element.text()).toBe('2 / 5');
        });
    });
});
