import { useEffect, useRef, useState, type FormEventHandler } from "react";
import { type ActionState } from "@/core/types";
import { ErrorMessages } from "@/domain/messages";
import { readForm, type ReadField, type ReadFieldValues } from "@/ui/forms/handlers/read-form";
import { type LibraryFieldProps } from "@/ui/components/library-field/library-field";

export type InfoRow = { label: string; value: string };
export type Field = LibraryFieldProps;
type Query<T> = () => Promise<ActionState<T>>;

export interface FormSpec<T> {
    label: string;
    fields: Field[];
    submit: (field: ReadField, values: ReadFieldValues) => T;
    submitDisabled?: boolean;
    onOpen?: () => void;
}

export interface DetailSection {
    title: string;
    entries: { id: string; label: string }[];
    emptyMessage: string;
}

export interface DetailSpec {
    info: InfoRow[];
    sections?: DetailSection[];
    forms?: FormSpec<Promise<ActionState<unknown>>>[];
    commands?: { label: string; confirm: string; execute: Query<unknown>; tone?: "primary" | "danger" }[];
    queries?: { label: string; load: Query<DetailSection[]> }[];
}

async function resolve<T>(query: Query<T>): Promise<ActionState<T>> {
    try {
        return await query();
    } catch {
        return { success: false, error: ErrorMessages.UNEXPECTED_ERROR };
    }
}

export interface RecordsOptions<T extends { id: string }, D, F> {
    title: string;
    initialFilters: F;
    filter?: FormSpec<F>;
    load: (filters: F) => Promise<ActionState<T[]>>;
    loadDetail?: (id: string) => Promise<ActionState<D>>;
    getLabel: (record: T) => string;
    describe?: (detail: D) => DetailSpec;
    create?: FormSpec<Promise<ActionState<unknown>>>;
}

export interface FormView {
    submitDisabled?: boolean;
    label: string;
    fields: Field[];
    onSubmit: FormEventHandler<HTMLFormElement>;
}

export interface LibraryRecordsView {
    title: string;
    filter?: FormView;
    create?: FormView;
    createLabel?: string;
    toggleCreate: () => void;
    feedback: { message: string; error: boolean } | null;
    loading: boolean;
    error: string | null;
    isSaving: boolean;
    refresh: () => void;
    records: { id: string; label: string; selected: boolean; select?: () => void }[];
    detail?: {
        loading: boolean;
        error: string | null;
        info: InfoRow[];
        sections: DetailSection[];
        forms: FormView[];
        commands: { label: string; onClick: () => void; tone?: "primary" | "danger" }[];
        queries: { label: string; onClick: () => void }[];
        extraLoading: boolean;
        extraError: string | null;
        extraSections: DetailSection[];
    };
}

export function pickData<T, R>(result: ActionState<T>, pick: (data: T) => R): ActionState<R> {
    if (!result.success || result.data == null) {
        return { success: false, error: result.error || ErrorMessages.UNEXPECTED_ERROR };
    }
    return { success: true, data: pick(result.data) };
}

export function info(label: string, value: string | number | Date | null | undefined): InfoRow {
    return { label, value: value instanceof Date ? value.toISOString().slice(0, 10) : String(value ?? "") || "—" };
}

export function allOptions(options: { value: string; label: string }[]): { value: string; label: string }[] {
    return [{ value: "", label: "Todos" }, ...options];
}

export function useLibraryRecordsViewModel<T extends { id: string }, D, F>(
    options: RecordsOptions<T, D, F>
): LibraryRecordsView {
    const { title, load, loadDetail, describe, getLabel, create, filter, initialFilters } = options;

    const [filters, setFilters] = useState(initialFilters);
    const [revision, setRevision] = useState(0);
    const [loaded, setLoaded] = useState<{ load: typeof load; result: ActionState<T[]> } | null>(null);
    const [selection, setSelection] = useState<{ id: string } | null>(null);
    const [detail, setDetail] = useState<{ selection: typeof selection; loadDetail: typeof loadDetail; result: ActionState<D> } | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<LibraryRecordsView["feedback"]>(null);

    const extraVersion = useRef(0);
    const [extraLoading, setExtraLoading] = useState(false);
    const [extra, setExtra] = useState<ActionState<DetailSection[]> | null>(null);
    const saving = useRef(false);

    {/* ===== Main useEffects ===== */ }

    useEffect(() => {
        let active = true;
        void resolve(() => load(filters)).then((result) => {
            if (active) setLoaded({ load, result });
        });
        return () => {
            active = false;
        };
    }, [load, filters, revision]);

    useEffect(() => {
        if (!selection || !loadDetail) return;
        let active = true;
        void resolve(() => loadDetail(selection.id)).then((result) => {
            if (active) setDetail({ selection, loadDetail, result });
        });
        return () => {
            active = false;
        };
    }, [loadDetail, selection]);

    {/* ===== Fetch data ===== */ }

    const runQuery = async (loadExtra: Query<DetailSection[]>) => {
        const version = ++extraVersion.current;
        setExtra(null);
        setExtraLoading(true);
        const result = await resolve(loadExtra);
        if (version !== extraVersion.current) return;
        setExtra(result);
        setExtraLoading(false);
    };

    {/* ===== onActions functions ===== */ }

    const clearExtra = () => {
        extraVersion.current += 1;
        setExtra(null);
        setExtraLoading(false);
    };

    const refresh = () => {
        setLoaded(null);
        setRevision((current) => current + 1);
    };

    const toggleCreate = () => {
        if (!isCreating) create?.onOpen?.();
        setIsCreating(!isCreating);
        setSelection(null);
        clearExtra();
        setFeedback(null);
    };

    {/* ===== handlers functions ===== */ }

    const handleSave = async (action: Query<unknown>) => {
        if (saving.current) return;
        saving.current = true;
        setIsSaving(true);
        setFeedback(null);
        try {
            const result = await resolve(action);
            if (result.success) {
                setIsCreating(false);
                setSelection(null);
                clearExtra();
                refresh();
            }
            setFeedback({
                error: !result.success,
                message: result.success ? result.message || "Cambios guardados." : result.error || ErrorMessages.UNEXPECTED_ERROR
            });
        } finally {
            saving.current = false;
            setIsSaving(false);
        }
    };

    const writeForm = (form: FormSpec<ReturnType<Query<unknown>>>): FormView => {
        return {
            label: form.label,
            fields: form.fields,
            submitDisabled: form.submitDisabled,
            onSubmit: (event) => readForm(event, (field, values) => {
                if (!form.submitDisabled) void handleSave(() => form.submit(field, values));
            })
        };
    };

    {/* ===== variables ===== */ }

    const list = loaded?.load === load ? loaded.result : null;
    const currentDetail = detail?.selection === selection && detail?.loadDetail === loadDetail ? detail?.result : null;
    const spec = currentDetail?.data && describe ? describe(currentDetail.data) : undefined;

    const filterView: FormView | undefined = filter ? {
        label: filter.label,
        fields: filter.fields,
        onSubmit: (event) => readForm(event, (field, values) => {
            const next = filter.submit(field, values);
            setFilters(next);
            setSelection(null);
            clearExtra();
            refresh();
        })
    } : undefined;

    const createView: FormView | undefined = isCreating && create ? writeForm(create) : undefined;
    const createLabel = create && (isCreating ? "Cancelar" : create.label);

    const records = (list?.data ?? []).map((record) => ({
        id: record.id,
        label: getLabel(record),
        selected: selection?.id === record.id,
        select: loadDetail ? () => {
            setSelection(selection?.id === record.id ? null : { id: record.id });
            setIsCreating(false);
            clearExtra();
            setFeedback(null);
        } : undefined
    }));

    const detailView = selection ? {
        loading: !currentDetail,
        error: currentDetail && !currentDetail.success ? currentDetail.error || ErrorMessages.UNEXPECTED_ERROR : null,
        info: spec?.info ?? [],
        sections: spec?.sections ?? [],
        forms: spec?.forms?.map(writeForm) ?? [],
        commands: spec?.commands?.map(({ label, confirm, execute, tone }) => ({
            label,
            tone,
            onClick: () => {
                if (window.confirm(confirm)) void handleSave(execute);
            }
        })) ?? [],
        queries: spec?.queries?.map(({ label, load: loadExtra }) => ({
            label,
            onClick: () => void runQuery(loadExtra)
        })) ?? [],
        extraLoading,
        extraError: extra && !extra.success ? extra.error || ErrorMessages.UNEXPECTED_ERROR : null,
        extraSections: extra?.data ?? []
    } : undefined;

    return {
        title,
        filter: filterView,
        create: createView,
        createLabel,
        toggleCreate,
        feedback,
        loading: !list,
        error: list && !list.success ? list.error || ErrorMessages.UNEXPECTED_ERROR : null,
        isSaving,
        refresh,
        records,
        detail: detailView
    };
}

export default useLibraryRecordsViewModel;
