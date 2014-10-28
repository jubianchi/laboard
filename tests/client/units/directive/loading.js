describe('directive: loading', function() {
    beforeEach(module('laboard-frontend'));

    var scope, compile, element;

    beforeEach(inject(function($rootScope, $compile) {
        scope = $rootScope.$new();
        compile = $compile;
    }));

    describe('with a falsy condition', function() {
        it("should display the loader if condition not set in scope", function() {
            element = compile('<div data-loading="condition"></counter>')(scope);
            scope.$digest();

            expect(element.find('.spinner-container').size()).toBe(1);
        });

        it("should display the loader if bound condition is 0", function() {
            element = compile('<div data-loading="condition"></counter>')(scope);
            scope.condition = 0;
            scope.$digest();

            expect(element.find('.spinner-container').size()).toBe(1);
        });

        it("should display the loader if condition is 0", function() {
            element = compile('<div data-loading="0"></counter>')(scope);
            scope.$digest();

            expect(element.find('.spinner-container').size()).toBe(1);
        });
    });

    describe('with a truthy condition', function() {
        it("should not display the loader if bound condition is greater than 0", function() {
            element = compile('<div data-loading="condition"></counter>')(scope);
            scope.condition = 1;
            scope.$digest();

            expect(element.find('.spinner-container').size()).toBe(0);
        });

        it("should display the loader if condition is 1", function() {
            element = compile('<div data-loading="1"></counter>')(scope);
            scope.$digest();

            expect(element.find('.spinner-container').size()).toBe(0);
        });
    });

    describe('with a chaiging condition value', function() {
        it("should disappear if bound condition changes to a truthy value", function() {
            element = compile('<div data-loading="condition"></counter>')(scope);
            scope.condition = 0;
            scope.$digest();

            expect(element.find('.spinner-container').size()).toBe(1);

            scope.condition = 1;
            scope.$digest();

            expect(element.find('.spinner-container').size()).toBe(0);
        });

        it("should not add loader twice if value changes to a falsy value", function() {
            element = compile('<div data-loading="condition"></counter>')(scope);
            scope.condition = 0;
            scope.$digest();

            expect(element.find('.spinner-container').size()).toBe(1);

            scope.condition = false;
            scope.$digest();

            expect(element.find('.spinner-container').size()).toBe(1);
        });
    });
});
