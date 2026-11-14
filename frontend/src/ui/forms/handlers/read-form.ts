import { type FormEvent } from "react";

export type ReadField = (name: string) => string;
export type ReadFieldValues = (name: string) => string[];

export function readForm(event: FormEvent<HTMLFormElement>, submit: (field: ReadField, values: ReadFieldValues) => void): void {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    submit((name) => {
        const value = String(data.get(name) ?? "");
        return name === "password" ? value : value.trim();
    }, (name) => data.getAll(name).map(String));
}
