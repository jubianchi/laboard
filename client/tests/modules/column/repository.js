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
            var column = {
                title: 'foo'
            };

            ColumnsRepository.add({ title: 'column' });
            ColumnsRepository.add({ title: 'otherColumn' });

            expect(ColumnsRepository.$objects.length).toBe(2);

            ColumnsRepository.clear();

            expect(ColumnsRepository.$objects).toBeNull();
        }));
    });
});
