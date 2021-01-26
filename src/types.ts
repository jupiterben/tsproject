type BasicType = boolean | number | string | undefined | null | void | never | symbol;
type ObjectKeyType = number | string | symbol;

interface IAnyObj extends Record<ObjectKeyType, any> {
    x: number,
}


let a: IAnyObj = {
    x: 1,
    y: 2,
}

a['x'] = 1;
