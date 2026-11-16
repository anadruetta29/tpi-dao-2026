import { type FormEvent } from "react";

export function formatTimeInput(value: string): string {
    const digits = value.replace(/[^0-9]/g, "").slice(0, 4);
    return digits.length <= 2 ? digits : `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function onTimeInput(event: FormEvent<HTMLInputElement>): void {
    const input = event.currentTarget;
    const formatted = formatTimeInput(input.value);
    if (input.value === formatted) return;

    const cursor = input.selectionStart ?? input.value.length;
    const formattedPrefix = formatTimeInput(input.value.slice(0, cursor));
    input.value = formatted;
    input.setSelectionRange(formattedPrefix.length, formattedPrefix.length);
}
