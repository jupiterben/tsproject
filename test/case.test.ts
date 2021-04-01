import { MyClass } from '../src/myclass';

describe('test', () => {
    it('create MyClass', async () => {
        expect(new MyClass()).toBeInstanceOf(MyClass)
    });
});
