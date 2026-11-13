import React, { useEffect, useState } from "react";
import { type ActionState } from "@/core/types";
import { ErrorMessages } from "@/domain/messages";
import { libraryButtonStyle, libraryControlsStyle } from "./library-records.styles";

const cardStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    padding: "1rem",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    textAlign: "left",
    overflowWrap: "anywhere"
};

interface LibraryRecordControls {
    isSaving: boolean;
    save: (action: () => Promise<ActionState<unknown>>) => Promise<void>;
}

interface LibraryRecordsProps<T extends { id: string }> {
    title: string;
    createLabel: string;
    load: () => Promise<ActionState<T[]>>;
    loadDetail: (id: string) => Promise<ActionState<T>>;
    getLabel: (record: T) => string;
    renderCreate: (controls: LibraryRecordControls) => React.ReactNode;
    renderDetail: (record: T, controls: LibraryRecordControls) => React.ReactNode;
    filters?: React.ReactNode;
}

export function LibraryRecords<T extends { id: string }>({
    title,
    createLabel,
    load,
    loadDetail,
    getLabel,
    renderCreate,
    renderDetail,
    filters
}: LibraryRecordsProps<T>) {
    const [list, setList] = useState<{ load: typeof load; result: ActionState<T[]> } | null>(null);
    const [detail, setDetail] = useState<ActionState<T> | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [revision, setRevision] = useState(0);
    const [feedback, setFeedback] = useState<ActionState<unknown> | null>(null);

    useEffect(() => {
        let ignore = false;
        void load().then((result) => {
            if (!ignore) setList({ load, result });
        });
        return () => { ignore = true; };
    }, [load, revision]);

    useEffect(() => {
        if (!selectedId) return;

        let ignore = false;
        void loadDetail(selectedId).then((result) => {
            if (!ignore) setDetail(result);
        });
        return () => { ignore = true; };
    }, [loadDetail, selectedId]);

    const refresh = () => {
        setList(null);
        setRevision((current) => current + 1);
    };

    const save = async (action: () => Promise<ActionState<unknown>>) => {
        if (isSaving) return;

        setIsSaving(true);
        setFeedback(null);
        const result = await action();
        if (result.success) {
            setIsCreating(false);
            setSelectedId(null);
            setDetail(null);
            refresh();
        }
        setFeedback(result);
        setIsSaving(false);
    };

    const controls = { isSaving, save };
    const result = list?.load === load ? list.result : null;

    return (
        <section aria-label={title} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", padding: "2rem" }}>
            <h2 style={{ margin: 0 }}>{title}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", maxWidth: "620px" }}>
                {filters && <fieldset disabled={isSaving} style={{ border: 0, padding: 0, margin: 0 }}>{filters}</fieldset>}
                <div style={libraryControlsStyle}>
                    <button type="button" style={libraryButtonStyle} disabled={isSaving} onClick={() => {
                        setIsCreating(!isCreating);
                        setSelectedId(null);
                        setDetail(null);
                        setFeedback(null);
                    }}>
                        {isCreating ? "Cancelar" : createLabel}
                    </button>
                </div>
                {feedback?.success && <p role="status">{feedback.message}</p>}
                {feedback && !feedback.success && <p role="alert">{feedback.error || ErrorMessages.UNEXPECTED_ERROR}</p>}
                {isCreating && <div style={cardStyle}>{renderCreate(controls)}</div>}
                {!result && <p role="status">Cargando...</p>}
                {result && !result.success && (
                    <div style={cardStyle}>
                        <p role="alert">{result.error || ErrorMessages.UNEXPECTED_ERROR}</p>
                        <button type="button" style={libraryButtonStyle} disabled={isSaving} onClick={refresh}>Reintentar</button>
                    </div>
                )}
                {result?.data?.length === 0 && <p>No hay resultados.</p>}
                {!!result?.data?.length && (
                    <ul style={{ display: "flex", flexDirection: "column", gap: "0.75rem", margin: 0, padding: 0, listStyle: "none" }}>
                        {result.data.map((record) => {
                            const isSelected = selectedId === record.id;

                            return (
                                <li key={record.id} style={cardStyle}>
                                    <strong>{getLabel(record)}</strong>
                                    <div style={libraryControlsStyle}>
                                        <button type="button" style={libraryButtonStyle} disabled={isSaving} aria-expanded={isSelected} onClick={() => {
                                            setSelectedId(isSelected ? null : record.id);
                                            setDetail(null);
                                            setIsCreating(false);
                                            setFeedback(null);
                                        }}>
                                            {isSelected ? "Cerrar detalle" : "Ver detalle"}
                                        </button>
                                    </div>
                                    {isSelected && !detail && <p role="status">Cargando detalle...</p>}
                                    {isSelected && detail && !detail.success && <p role="alert">{detail.error || ErrorMessages.UNEXPECTED_ERROR}</p>}
                                    {isSelected && detail?.data && renderDetail(detail.data, controls)}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </section>
    );
}
