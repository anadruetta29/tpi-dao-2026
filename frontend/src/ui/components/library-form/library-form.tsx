import React from "react";
import { libraryButtonStyle, libraryControlsStyle } from "@/ui/components/library-records/library-records.styles";

interface LibraryFormProps {
    children: React.ReactNode;
    label: string;
    isSaving?: boolean;
    onSubmit: (field: (name: string) => string) => void;
}

export const LibraryForm: React.FC<LibraryFormProps> = ({ children, label, isSaving, onSubmit }) => {
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        onSubmit((name) => String(data.get(name) ?? "").trim());
    };

    return (
        <form onSubmit={handleSubmit}>
            <fieldset disabled={isSaving} style={{ ...libraryControlsStyle, border: 0, padding: 0, margin: 0 }}>
                {children}
                <button type="submit" style={libraryButtonStyle}>{isSaving ? "Guardando..." : label}</button>
            </fieldset>
        </form>
    );
};
