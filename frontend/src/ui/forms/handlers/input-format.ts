import { type FormEvent } from "react";

function formatInput(event: FormEvent<HTMLInputElement>, format: (value: string) => string): void {
    if ((event.nativeEvent as InputEvent | undefined)?.isComposing) return;

    const input = event.currentTarget;
    const formatted = format(input.value);
    if (input.value === formatted) return;

    const cursor = input.selectionStart ?? input.value.length;
    const formattedPrefix = format(input.value.slice(0, cursor));
    input.value = formatted;
    input.setSelectionRange(formattedPrefix.length, formattedPrefix.length);
}

export function digitsInput(maxLength: number) {
    return (event: FormEvent<HTMLInputElement>) => {
        formatInput(event, (value) => value.replace(/[^0-9]/g, "").slice(0, maxLength));
    };
}

export function lettersInput(event: FormEvent<HTMLInputElement>): void {
    formatInput(event, (value) => value.normalize("NFC").replace(/[^\p{L} ]/gu, ""));
}
