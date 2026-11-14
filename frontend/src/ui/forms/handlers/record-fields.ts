import { type LibraryFieldProps } from "@/ui/components/library-field/library-field";
import { type ReadField } from "./read-form";

export function idField(name: string, label: string, required = false): LibraryFieldProps {
    return { name, label, placeholder: "Ej. 123", required, pattern: "[1-9][0-9]*" };
}

export function readFields<const K extends string>(field: ReadField, ...names: K[]): Record<K, string> {
    return Object.fromEntries(names.map((name) => [name, field(name)])) as Record<K, string>;
}
