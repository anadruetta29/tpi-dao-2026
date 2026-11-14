import assert from "node:assert/strict";
import { test } from "node:test";
import { formatTimeInput } from "../src/ui/routes/sedes/horario-input.ts";

test("el horario inserta el separador al escribir y limpia el texto pegado", () => {
    assert.equal(formatTimeInput("09"), "09");
    assert.equal(formatTimeInput("093"), "09:3");
    assert.equal(formatTimeInput("0930"), "09:30");
    assert.equal(formatTimeInput(" 17:45 "), "17:45");
    assert.equal(formatTimeInput("09:"), "09");
    assert.equal(formatTimeInput("a0930x5"), "09:30");
    assert.equal(formatTimeInput(""), "");
});
