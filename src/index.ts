type Converter<T, U> = (a: T) => U;
type ArrayElement<T> = T extends ReadonlyArray<infer E> ? E : never;
type Replace<T, K extends keyof T, V> = Omit<T, K> & Record<K, V>;

const IDENTITY: Converter<any, any> = item => item;

export interface TransformBuilder<T, U> {
    pick<K extends keyof U>(...keys: K[]): Transform<T, Pick<U, K>>;
    mapProperty<K extends keyof U, B>(key: K, converter: Converter<U[K], B>): Transform<T, Replace<U, K, B>>;
    mapArray<K extends keyof U, A extends ArrayElement<U[K]>, B>(key: K, converter: Converter<A, B>): Transform<T, Replace<U, K, B[]>>;
}

export type Transform<T, U> = Converter<T, U> & TransformBuilder<T, U>;

function pick<T, K extends keyof T>(item: T, keys: K[]) {
    return Object.fromEntries(Object.entries(item)
        .filter(([k]) => keys.includes(k as K))) as Pick<T, K>
}

function mapProperty<T extends Record<K, A>, K extends keyof T, A, B>(
    item: T,
    key: K,
    converter: Converter<A, B>
) {
    return {...item, [key]: converter(item[key])} as Omit<T, K> & Record<K, B>;
}

function join<T, U, V>(c1: Converter<T, U>, c2: Converter<U, V>) {
    return (item: T) => c2(c1(item));
}

function createTransform<T, U>(ctu: Converter<T, U>): Transform<T, U> {
    function build<V>(cuv: Converter<U, V>): Transform<T, V> {
        return createTransform(join(ctu, cuv));
    }

    const builder: TransformBuilder<T, U> = {
        pick: <K extends keyof U>(...keys: K[]) => build(item => pick(item, keys)),
        mapProperty: <K extends keyof U, A>(key: K, converter: Converter<U[K], A>) => build(item => mapProperty(item, key, converter)),
        mapArray: <K extends keyof U, A extends ArrayElement<U[K]>, B>(key: K, converter: Converter<A, B>) => build(item => {
            if (!Array.isArray(item[key])) {
                throw new Error(`Cannot apply map transform; property ${key} is not an array`);
            }
            return mapProperty(item, key, (items: A[]) => items.map(converter));
        })

    };
    return Object.assign((item: T) => ctu(item), builder);
}

export const transform = <T>() => createTransform<T, T>(IDENTITY);

