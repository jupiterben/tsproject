import { MyClass } from '../src/myclass';

test('test MyClass', () => {
    it('create MyClass', async () => {
        expect(new MyClass()).toBeInstanceOf(MyClass)
    });
});
