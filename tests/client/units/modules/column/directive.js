describe('module: column', function() {
    beforeEach(module('laboard-frontend'));

    describe('directive: columns', function() {
        var scope, compile, element;

        beforeEach(inject(function($rootScope, $compile) {
            scope = $rootScope.$new();
            compile = $compile;
        }));

        describe('with only one column', function() {
            beforeEach(inject(function() {
                element = compile('<div data-columns><div data-column></div></div>')(scope);
            }));

            it("should set width to 100%", function() {
                scope.$digest();

                expect(element.find('div[data-column]').css('width')).toBe('100%');
            });
        });

        describe('with more columns', function() {
            beforeEach(inject(function() {
                element = compile('<div data-columns><div data-column></div><div data-column></div></div>')(scope);
            }));

            it("should set width", function() {
                scope.$digest();

                expect(element.find('div[data-column]').css('width')).toBe('300px');
            });

            it("should update width when new column is added", function() {
                scope.$digest();

                expect(element.find('div[data-column]').css('width')).toBe('300px');

                element.append('<div data-column></div><div data-column></div>');
                scope.$digest();

                expect(element.find('div[data-column]').css('width')).toBe('300px');
            });
        });
    });
});
