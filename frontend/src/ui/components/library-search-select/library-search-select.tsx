import { useId, type KeyboardEventHandler } from "react";
import { LibraryButton } from "@/ui/components/library-button/library-button";
import { LibraryStatus } from "@/ui/components/library-status/library-status";
import styles from "./style.module.css";

export interface SearchOption {
    value: string;
    label: string;
}

export interface LibrarySearchSelectProps {
    name: string;
    label: string;
    placeholder: string;
    query: string;
    value: string;
    options: SearchOption[];
    status: string;
    required?: boolean;
    retry?: () => void;
    selectedItems?: SearchOption[];
    onRemove?: (value: string) => void;
    expanded: boolean;
    activeIndex: number;
    onOpen: () => void;
    onClose: () => void;
    onKeyDown: KeyboardEventHandler<HTMLInputElement>;
    onSearch: (text: string) => void;
    onSelect: (option: SearchOption) => void;
}

export function LibrarySearchSelect({
    name, label, placeholder, query, value, options, status, expanded, activeIndex, required, retry, selectedItems, onRemove,
    onOpen, onClose, onKeyDown, onSearch, onSelect
}: LibrarySearchSelectProps) {
    const id = useId();
    const listId = `${id}-options`;

    return (
        <div className={styles.field}>
            <label htmlFor={id}>{label}</label>
            <div className={styles.control}>
                <input id={id} type="text" role="combobox" placeholder={placeholder} value={query} autoComplete="off"
                    aria-expanded={expanded} aria-autocomplete="list" aria-required={required} aria-controls={listId}
                    aria-activedescendant={expanded && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
                    onFocus={onOpen} onClick={onOpen} onBlur={onClose} onKeyDown={onKeyDown}
                    onChange={(event) => onSearch(event.target.value)} />
                {!selectedItems && <input type="hidden" name={name} value={value} />}
                <div className={styles.popup} hidden={!expanded}>
                    {status && !retry && <p role="status" className={styles.status}>{status}</p>}
                    <ul id={listId} role="listbox" aria-label={label} className={styles.options}>
                        {options.map((option, index) => (
                            <li key={option.value} id={`${listId}-${index}`} role="option"
                                aria-selected={option.value === value} data-active={index === activeIndex}
                                onMouseDown={(event) => event.preventDefault()} onClick={() => onSelect(option)}>
                                {option.label}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {retry && (
                <>
                    <LibraryStatus kind="error">{status}</LibraryStatus>
                    <LibraryButton onClick={retry}>Reintentar</LibraryButton>
                </>
            )}
            {selectedItems && selectedItems.length > 0 && (
                <ul className={styles.selected}>
                    {selectedItems.map((option) => (
                        <li key={option.value}>
                            {option.label}
                            <button type="button" aria-label={`Quitar ${option.label}`} onClick={() => onRemove?.(option.value)}>×</button>
                            <input type="hidden" name={name} value={option.value} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
