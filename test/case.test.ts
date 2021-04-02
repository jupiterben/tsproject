import { MyClass } from '../src/lib';

describe('test MyClass', () => {
    test('create MyClass', async () => {
        expect(new MyClass()).toBeInstanceOf(MyClass)
    });
});
