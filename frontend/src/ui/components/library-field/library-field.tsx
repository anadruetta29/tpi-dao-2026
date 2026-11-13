import React, { useId } from "react";

interface LibraryFieldProps {
    name: string;
    label: string;
    type?: React.HTMLInputTypeAttribute;
    defaultValue?: string;
    onChange?: (value: string) => void;
    required?: boolean;
    options?: { value: string; label: string }[];
}

export const LibraryField: React.FC<LibraryFieldProps> = ({
    name,
    label,
    type = "text",
    defaultValue,
    onChange,
    required,
    options
}) => {
    const id = useId();
    const style = { padding: "0.65rem 0.75rem", borderRadius: "6px", border: "1px solid #ccc", fontSize: "0.95rem" };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", textAlign: "left" }}>
            <label htmlFor={id} style={{ fontWeight: 600, fontSize: "0.9rem" }}>{label}</label>
            {options ? (
                <select id={id} name={name} defaultValue={defaultValue} onChange={(event) => onChange?.(event.target.value)} required={required} style={style}>
                    {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
            ) : (
                <input
                    id={id}
                    name={name}
                    type={type}
                    defaultValue={defaultValue}
                    required={required}
                    pattern={type === "text" && name.endsWith("Id") ? "[1-9][0-9]*" : undefined}
                    inputMode={type === "text" && name.endsWith("Id") ? "numeric" : undefined}
                    style={style}
                />
            )}
        </div>
    );
};
