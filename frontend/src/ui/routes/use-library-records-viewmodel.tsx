import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type FormEventHandler, type MouseEventHandler, type SyntheticEvent } from "react";
import { type ActionState } from "@/core/types";
import { ErrorMessages } from "@/domain/messages";
import { readForm, type ReadField, type ReadFieldValues } from "@/ui/forms/handlers/read-form";
import { type LibraryFieldProps } from "@/ui/components/library-field/library-field";
import { moduleIcon, statusBadge, type StatusBadgeView } from "@/ui/components/library-records/viewmodel";
import type { LibraryIconName } from "@/ui/components/library-icon/library-icon";
import { useFormFieldsViewModel } from "@/ui/components/library-form/viewmodel";

export type InfoRow = { label: string; value: string; badge?: StatusBadgeView };
export type Field = LibraryFieldProps;
type Query<T> = () => Promise<ActionState<T>>;

export interface FormSpec<T> {
    label: string;
    layout?: "grid" | "stack" | "filters";
    fields: Field[];
    submit: (field: ReadField, values: ReadFieldValues) => T;
    submitDisabled?: boolean;
    onOpen?: () => void;
}

export type DetailSection = {
    title: string;
    emptyMessage: string;
} & (
    | { kind?: "list"; entries: { id: string; label: string; detail?: string; badge?: StatusBadgeView }[] }
    | { kind: "timeline"; entries: { id: string; label: string; current: boolean; metadata: InfoRow[] }[] }
);

export interface DetailSpec {
    info: InfoRow[];
    sections?: DetailSection[];
    forms?: FormSpec<Promise<ActionState<unknown>>>[];
    commands?: { label: string; confirm: string; execute: Query<unknown>; tone?: "primary" | "danger" }[];
    actions?: { label: string; onClick: () => void; tone?: "primary" | "danger" }[];
    queries?: { label: string; load: Query<DetailSection[]> }[];
}

async function resolve<T>(query: Query<T>): Promise<ActionState<T>> {
    try {
        return await query();
    } catch {
        return { success: false, error: ErrorMessages.UNEXPECTED_ERROR };
    }
}

function useDetailQueriesViewModel() {
    const extraVersion = useRef(0);
    const [extraLoading, setExtraLoading] = useState(false);
    const [extra, setExtra] = useState<ActionState<DetailSection[]> | null>(null);

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

    const clearExtra = useCallback(() => {
        extraVersion.current += 1;
        setExtra(null);
        setExtraLoading(false);
    }, []);

    return { extra, extraLoading, clearExtra, runQuery };
}

export interface RecordsOptions<T extends { id: string }, D, F> {
    title: string;
    initialFilters: F;
    initialRecordId?: string;
    initiallyOpen?: boolean;
    newestFirst?: boolean;
    filter?: FormSpec<F>;
    load: (filters: F) => Promise<ActionState<T[]>>;
    loadDetail?: (id: string) => Promise<ActionState<D>>;
    getLabel: (record: T) => string;
    getDisplayId?: (record: T, index: number) => string;
    getMeta?: (record: T) => string;
    getStatuses?: (record: T) => (string | StatusBadgeView)[];
    describe?: (detail: D) => DetailSpec;
    describeRecord?: (record: T) => DetailSpec;
    create?: FormSpec<Promise<ActionState<unknown>>>;
    onSelectRecord?: () => void;
}

export interface FormView {
    revision?: number;
    layout?: "grid" | "stack" | "filters";
    onClear?: () => void;
    clearDisabled?: boolean;
    onChange?: FormEventHandler<HTMLFormElement>;
    submitDisabled?: boolean;
    label: string;
    fields: Field[];
    onSubmit: FormEventHandler<HTMLFormElement>;
}

export interface LibraryRecordsView {
    title: string;
    icon: LibraryIconName;
    filter?: FormView;
    filterBadge?: StatusBadgeView;
    create?: FormView;
    createLabel?: string;
    toggleCreate: () => void;
    feedback: { message: string; error: boolean } | null;
    loading: boolean;
    error: string | null;
    isSaving: boolean;
    refresh: () => void;
    createId: string;
    confirmation?: { id: string; label: string; message: string; tone: "primary" | "danger"; cancel: (event?: SyntheticEvent) => void; confirm: () => void };
    records: { id: string; displayId: string; label: string; meta?: string; badges: StatusBadgeView[]; selected: boolean; select?: () => void;
        clickRow?: MouseEventHandler<HTMLDivElement>; scrollId?: string }[];
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

export function statusInfo(value: string | null | undefined, tone?: StatusBadgeView["tone"], label = "Estado"): InfoRow {
    return { ...info(label, value), badge: value ? statusBadge(value, tone) : undefined };
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
    const [selection, setSelection] = useState<{ id: string } | null>(
        options.initialRecordId ? { id: options.initialRecordId } : null
    );
    const [detail, setDetail] = useState<{ selection: typeof selection; loadDetail: typeof loadDetail; result: ActionState<D> } | null>(null);
    const [isCreating, setIsCreating] = useState(Boolean(options.initiallyOpen));
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState<LibraryRecordsView["feedback"]>(null);
    const [filterRevision, setFilterRevision] = useState(0);
    const [filterDraft, setFilterDraft] = useState<Record<string, boolean>>({});
    const [pending, setPending] = useState<NonNullable<DetailSpec["commands"]>[number] | null>(null);
    const formFields = useFormFieldsViewModel();
    const regionId = useId();
    const dialogId = `${regionId}-confirm`;

    useLayoutEffect(() => {
        if (!pending) return;
        const dialog = document.getElementById(dialogId) as HTMLDialogElement | null;
        if (dialog && !dialog.open) dialog.showModal();
    }, [pending, dialogId]);

    const cancel = (event?: SyntheticEvent) => {
        event?.preventDefault();
        (document.getElementById(dialogId) as HTMLDialogElement | null)?.close();
        setPending(null);
    };

    const scrollIfOutside = useCallback((node: HTMLElement | null) => {
        if (!node || !window.matchMedia("(max-width: 860px)").matches) return;
        const bounds = node.getBoundingClientRect();
        if (bounds.bottom > 0 && bounds.top >= 0 && bounds.top + 52 <= window.innerHeight) return;
        node.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    }, []);

    const { extra, extraLoading, clearExtra, runQuery } = useDetailQueriesViewModel();
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

    const refresh = () => {
        setLoaded(null);
        setRevision((current) => current + 1);
    };

    const toggleCreate = () => {
        formFields.clear();
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

    const writeForm = (form: FormSpec<ReturnType<Query<unknown>>>, scope: string): FormView => {
        return {
            label: form.label,
            layout: form.layout,
            fields: formFields.fields(form.fields, scope),
            submitDisabled: form.submitDisabled,
            onSubmit: (event) => readForm(event, (field, values) => {
                if (!form.submitDisabled) void handleSave(() => form.submit(field, values));
            })
        };
    };

    {/* ===== variables ===== */ }

    const list = loaded?.load === load ? loaded.result : null;
    const currentDetail = detail?.selection === selection && detail?.loadDetail === loadDetail ? detail?.result : null;
    const localRecord = options.describeRecord && selection
        ? list?.data?.find(({ id }) => id === selection.id)
        : undefined;
    const spec = localRecord ? options.describeRecord?.(localRecord) : currentDetail?.data && describe ? describe(currentDetail.data) : undefined;

    const filterApplied = JSON.stringify(filters) !== JSON.stringify(initialFilters);
    const filterHasDraft = Object.values(filterDraft).some(Boolean) || filter?.fields.some((field) =>
        field.kind === "search-select" && Boolean(field.query || field.selectedItems?.length));
    const filterView: FormView | undefined = filter ? {
        label: filter.label,
        fields: filter.fields,
        revision: filterRevision,
        clearDisabled: !filterApplied && !filterHasDraft,
        onChange: (event) => {
            const input = event.target as HTMLInputElement | HTMLSelectElement;
            const field = filter.fields.find(({ name }) => name === input.name);
            if (!field || field.kind) return;
            const defaultValue = field.defaultValue ?? field.options?.[0]?.value ?? "";
            setFilterDraft((current) => ({ ...current, [field.name]: input.value !== defaultValue }));
        },
        onClear: () => {
            filter.fields.forEach((field) => {
                if (field.kind === "search-select") field.reset?.();
            });
            setFilterRevision((value) => value + 1);
            setFilterDraft({});
            if (filterApplied) {
                setFilters(initialFilters);
                setSelection(null);
                clearExtra();
                refresh();
            }
        },
        onSubmit: (event) => readForm(event, (field, values) => {
            const next = filter.submit(field, values);
            setFilters(next);
            setSelection(null);
            clearExtra();
            refresh();
        })
    } : undefined;

    const createView: FormView | undefined = isCreating && create ? writeForm(create, "create") : undefined;
    const createLabel = create && (isCreating ? "Cancelar" : create.label);

    const rawItems = list?.data ?? [];
    const items = options.newestFirst
        ? [...rawItems].sort((a, b) => Number(b.id) - Number(a.id) || b.id.localeCompare(a.id))
        : rawItems;
    const initialRecord = options.initialRecordId && selection?.id === options.initialRecordId
        ? items.find(({ id }) => id === options.initialRecordId)
        : undefined;
    const ordered = initialRecord ? [initialRecord, ...items.filter((item) => item !== initialRecord)] : items;
    const createId = `${regionId}-editor`;
    const initialRowId = initialRecord ? `${regionId}-row` : undefined;
    useEffect(() => {
        const target = isCreating ? createId : initialRowId;
        if (target) scrollIfOutside(document.getElementById(target));
    }, [isCreating, createId, initialRowId, scrollIfOutside]);

    const selectRecord = (id: string) => {
        options.onSelectRecord?.();
        setSelection(selection?.id === id ? null : { id });
        formFields.clear();
        setIsCreating(false);
        clearExtra();
        setFeedback(null);
    };

    const records: LibraryRecordsView["records"] = [];
    for (const [index, record] of ordered.entries()) {
        records.push({
            id: record.id,
            displayId: options.getDisplayId ? options.getDisplayId(record, index) : `#${record.id}`,
            label: getLabel(record),
            meta: options.getMeta?.(record),
            badges: options.getStatuses?.(record).filter(Boolean).map((status) => typeof status === "string" ? statusBadge(status) : status) ?? [],
            selected: selection?.id === record.id,
            select: loadDetail || options.describeRecord ? () => selectRecord(record.id) : undefined,
            clickRow: (loadDetail || options.describeRecord) && !isSaving ? (event) => {
                if ((event.target as Element).closest("button, a, input") || window.getSelection()?.type === "Range") return;
                selectRecord(record.id);
            } : undefined,
            scrollId: initialRecord === record ? initialRowId : undefined
        });
    }

    const detailView = selection ? {
        loading: options.describeRecord ? !list : !currentDetail,
        error: currentDetail && !currentDetail.success ? currentDetail.error || ErrorMessages.UNEXPECTED_ERROR : null,
        info: spec?.info ?? [],
        sections: spec?.sections ?? [],
        forms: spec?.forms?.map((form) => writeForm(form, `detail:${form.label}`)) ?? [],
        commands: [
            ...(spec?.commands?.map((command) => ({
                label: command.label,
                tone: command.tone,
                onClick: () => setPending(command)
            })) ?? []),
            ...(spec?.actions ?? [])
        ],
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
        icon: moduleIcon(title),
        filter: filterView,
        filterBadge: filterApplied ? { label: "Filtro activo", tone: "active" } : undefined,
        create: createView,
        createLabel,
        toggleCreate,
        feedback,
        loading: !list,
        error: list && !list.success ? list.error || ErrorMessages.UNEXPECTED_ERROR : null,
        isSaving,
        refresh,
        createId,
        confirmation: pending ? {
            id: dialogId,
            label: pending.label,
            message: pending.confirm,
            tone: pending.tone ?? "danger",
            cancel,
            confirm: () => { cancel(); void handleSave(pending.execute); }
        } : undefined,
        records,
        detail: detailView
    };
}

export default useLibraryRecordsViewModel;
