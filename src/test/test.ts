import { expect } from "chai";
import {Transform, transform} from "../index";

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

const foo: Foo = {a: 'A', b: 1, c: {d: 'D'}, e: [{id: 'ID1', name: 'NAME1'}, {id: 'ID2', name: 'NAME2'}], f: ['FOO']};

describe('Tests', () => {
    it('Should create a blank transform', () => {
        const t = transform<Foo>();
        const foo2: Foo = t(foo);

        expect(foo2).to.eql(foo);
    });

    it('Should create a pick transform', () => {
        const t = transform<Foo>().pick('a', 'c');
        const foo2 = t(foo);

        expect(foo2).to.eql({a: foo.a, c: foo.c});
    });

    it('Should create a map property transform', () => {
        const t = transform<Foo>().mapProperty('b', b => b + 42);
        const foo2 = t(foo);

        expect(foo2).to.eql({...foo, b: 43});
    });

    it('Should create a map array transform', () => {
        const t = transform<Foo>().mapArray('e', e => e.name.slice(-1));
        const foo2 = t(foo);

        expect(foo2).to.eql({...foo, e: foo.e.map(e => e.name.slice(-1))});
    });

    it('Should create a map property transform making array mutable', () => {
        const t: Transform<Foo, Bar> = transform<Foo>().mapProperty('f', f => [...f]);
        const foo2 = t(foo);

        expect(foo2).to.eql(foo);

        foo2.f.push('BAR')
        expect(foo.f).to.not.include('BAR');
    });

    it('Should create a chained transform', () => {
        const t = transform<Foo>()
            .pick('a', 'b', 'e')
            .mapProperty('b', b => b + 42)
            .mapArray('e', e => e.name.slice(-1));

        const foo2 = t(foo);

        expect(foo2).to.eql({a: foo.a, b: foo.b + 42, e: foo.e.map(e => e.name.slice(-1))});
    });
});