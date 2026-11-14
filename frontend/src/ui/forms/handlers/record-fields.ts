import { type ReadField } from "./read-form";

export function readFields<const K extends string>(field: ReadField, ...names: K[]): Record<K, string> {
    return Object.fromEntries(names.map((name) => [name, field(name)])) as Record<K, string>;
}
