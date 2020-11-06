# transform-builder
An object transform builder

This is a helper to build object transform functions in chainable steps.

Example:

```
import {transform} from 'transform-builder';

type Foo = {
    a: string;
    b: number;
    c: {
        d: string;
    };
    e: Array<{ id: string, name: string }>;
    f: ReadonlyArray<string>;
};

type Bar = {
    b: number;
    f: Array<string>
};

const t = transform<Foo>()
  .pick('b', 'f')
  .mapProperty('f', f => [...f])
  .mapArray('e', ee => ee.id);
  
// t is now a function that transforms Foo:s into Bar:s; by 
// 1) picking 'b' and 'f' 2) transforming 'f' into a mutable array 3) mapping each element in 'e' to their 'id'
  
const foo: Foo = {a: 'A', b: 1, c: {d: 'D'}, e: [{id: 'ID1', name: 'NAME1'}, {id: 'ID2', name: 'NAME2'}], f: ['F1', 'F2']};
const bar: Bar = t(foo); // transform a Foo into a Bar 
```
