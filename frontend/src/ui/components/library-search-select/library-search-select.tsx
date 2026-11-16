import { useId, type KeyboardEventHandler, type MouseEventHandler, type Ref } from "react";
import { LibraryButton } from "@/ui/components/library-button/library-button";
import { LibraryIcon } from "@/ui/components/library-icon/library-icon";
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
    inputRef?: Ref<HTMLInputElement>;
    clear?: () => void;
    reset?: () => void;
    unselected?: boolean;
    preserveFocus?: MouseEventHandler<HTMLButtonElement>;
}

export function LibrarySearchSelect({
    name, label, placeholder, query, value, options, status, expanded, activeIndex, required, retry, selectedItems, onRemove,
    onOpen, onClose, onKeyDown, onSearch, onSelect, inputRef, clear, unselected, preserveFocus
}: LibrarySearchSelectProps) {
    const id = useId();
    const listId = `${id}-options`;

    return (
        <div className={styles.field}>
            <label htmlFor={id}>{label}</label>
            <div className={styles.control} data-clear={Boolean(clear)} data-selected={Boolean(value)} data-unselected={unselected}>
                <input id={id} ref={inputRef} type="text" role="combobox" placeholder={placeholder} value={query} autoComplete="off"
                    aria-expanded={expanded} aria-autocomplete="list" aria-required={required} aria-controls={listId}
                    aria-activedescendant={expanded && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
                    onFocus={onOpen} onClick={onOpen} onBlur={onClose} onKeyDown={onKeyDown}
                    onChange={(event) => onSearch(event.target.value)} />
                <span className={styles.searchIcon}><LibraryIcon name={value ? "check" : "search"} /></span>
                {clear && <button type="button" className={styles.clear} aria-label={`Limpiar ${label}`} onMouseDown={preserveFocus} onClick={clear}><LibraryIcon name="close" /></button>}
                {!selectedItems && <input type="hidden" name={name} value={value} />}
                <div className={styles.popup} hidden={!expanded} inert={!expanded}>
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
                            <span>{option.label}</span>
                            <button type="button" aria-label={`Quitar ${option.label}`} onClick={() => onRemove?.(option.value)}>
                                <LibraryIcon name="close" />
                            </button>
                            <input type="hidden" name={name} value={option.value} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
