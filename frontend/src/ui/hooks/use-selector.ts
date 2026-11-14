import { useEffect, useState } from "react";
import { type ActionState } from "@/core/types";
import { type LibrarySearchSelectProps, type SearchOption } from "@/ui/components/library-search-select/library-search-select";

function searchText(value: string): string {
    return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLowerCase();
}

export function useSelector(name: string, label: string, placeholder: string, required = true) {
    const [query, setQuery] = useState("");
    const [debounced, setDebounced] = useState("");
    const [selection, setSelection] = useState<SearchOption | null>(null);
    const [expanded, setExpanded] = useState(false);
    const [active, setActive] = useState(-1);

    useEffect(() => {
        const timeout = setTimeout(() => setDebounced(query), 300);
        return () => clearTimeout(timeout);
    }, [query]);

    return {
        selected: selection?.value ?? "",
        reset: () => { setQuery(""); setDebounced(""); setSelection(null); setExpanded(false); setActive(-1); },
        field: (result: ActionState<SearchOption[]> | null, pendingMessage = "Cargando opciones...",
            onSelectionChange?: (value: string) => void,
            onPick?: (option: SearchOption) => void): LibrarySearchSelectProps & { kind: "search-select" } => {
            const term = selection ? "" : searchText(debounced);
            const searching = !selection && query !== debounced;
            const options = searching ? [] : (result?.data ?? []).filter(({ label: optionLabel }) => searchText(optionLabel).includes(term));
            const activeIndex = active < options.length ? active : -1;
            const status = !result ? pendingMessage
                : !result.success ? result.error || "No se pudieron cargar las opciones."
                : searching ? "Buscando..."
                : options.length === 0 ? "No hay opciones que coincidan." : "";
            const close = () => { setExpanded(false); setActive(-1); };
            const select = (option: SearchOption) => {
                if (onPick) {
                    onPick(option);
                    setQuery("");
                    setDebounced("");
                    setActive(-1);
                    return;
                }
                if (selection?.value !== option.value) onSelectionChange?.(option.value);
                setSelection(option);
                setQuery(option.label);
                close();
            };

            return {
                kind: "search-select", name, label, placeholder, query, required,
                value: selection?.value ?? "", options, status, expanded, activeIndex,
                onOpen: () => setExpanded(true),
                onClose: close,
                onSearch: (text) => {
                    if (selection) onSelectionChange?.("");
                    setSelection(null);
                    setQuery(text);
                    setExpanded(true);
                    setActive(-1);
                },
                onSelect: select,
                onKeyDown: (event) => {
                    if (event.key === "Escape" && expanded) {
                        event.preventDefault();
                        close();
                    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                        event.preventDefault();
                        setExpanded(true);
                        if (!options.length) return;
                        const next = event.key === "ArrowDown"
                            ? (activeIndex + 1) % options.length
                            : activeIndex <= 0 ? options.length - 1 : activeIndex - 1;
                        setActive(next);
                    } else if (event.key === "Enter" && expanded) {
                        event.preventDefault();
                        if (activeIndex >= 0) select(options[activeIndex]);
                    }
                }
            };
        }
    };
}

export function useMultipleSelector(name: string, label: string, placeholder: string) {
    const selector = useSelector(name, label, placeholder);
    const [selected, setSelected] = useState<SearchOption[]>([]);

    return {
        selected,
        reset: () => { selector.reset(); setSelected([]); },
        field: (result: ActionState<SearchOption[]> | null, pendingMessage?: string) => {
            const available = result?.data
                ? { ...result, data: result.data.filter(({ value }) => !selected.some((item) => item.value === value)) }
                : result;
            return {
                ...selector.field(available, pendingMessage, undefined, (option) => {
                    setSelected((items) => items.some(({ value }) => value === option.value) ? items : [...items, option]);
                }),
                selectedItems: selected,
                onRemove: (value: string) => setSelected((items) => items.filter((item) => item.value !== value))
            };
        }
    };
}

