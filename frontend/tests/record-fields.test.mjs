import assert from "node:assert/strict";
import { test } from "node:test";
import { digitsInput, lettersInput } from "../src/ui/forms/handlers/input-format.ts";

test("los campos numéricos limpian el texto pegado y limitan los dígitos", () => {
    const input = { value: "+1a9e49", selectionStart: 3, setSelectionRange(start) { this.selectionStart = start; } };
    digitsInput(4)({ currentTarget: input });
    assert.equal(input.value, "1949");
    assert.equal(input.selectionStart, 1);

    input.value = "11 5555-1234 5";
    digitsInput(10)({ currentTarget: input });
    assert.equal(input.value, "1155551234");
});

test("los nombres conservan las letras acentuadas y los espacios al quitar números", () => {
    const input = { value: "Mari\u0301a2 José", selectionStart: 11, setSelectionRange(start) { this.selectionStart = start; } };
    lettersInput({ currentTarget: input });
    assert.equal(input.value, "María José");
});
