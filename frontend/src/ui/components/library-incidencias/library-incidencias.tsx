import { LibraryField } from "@/ui/components/library-field/library-field";
import { LibraryIcon } from "@/ui/components/library-icon/library-icon";
import { LibrarySearchSelect, type LibrarySearchSelectProps } from "@/ui/components/library-search-select/library-search-select";
import styles from "./style.module.css";

export interface IncidenciaItem {
    id: string;
    label: string;
    meta?: string;
}

export interface LibraryIncidenciasProps {
    name: string;
    selector: LibrarySearchSelectProps;
    items: IncidenciaItem[];
    estados: { value: string; label: string }[];
    onRemove: (id: string) => void;
}

export function LibraryIncidencias({ name, selector, items, estados, onRemove }: LibraryIncidenciasProps) {
    return (
        <div className={styles.wrapper}>
            <LibrarySearchSelect {...selector} selectedItems={undefined} />
            {items.length === 0 ? (
                <p className={styles.empty}>Seleccioná al menos un ejemplar para detallar su estado y observación.</p>
            ) : (
                <ul className={styles.list}>
                    {items.map((item) => (
                        <li key={item.id} className={styles.card}>
                            <input type="hidden" name={name} value={item.id} />
                            <div className={styles.cardHeader}>
                                <div className={styles.cardTitle}>
                                    <strong>{item.label}</strong>
                                    {item.meta && <span>{item.meta}</span>}
                                </div>
                                <button
                                    type="button"
                                    className={styles.remove}
                                    aria-label={`Quitar ${item.label}`}
                                    onClick={() => onRemove(item.id)}
                                >
                                    <LibraryIcon name="close" />
                                </button>
                            </div>
                            <div className={styles.cardFields}>
                                <LibraryField
                                    name={`estado_${item.id}`}
                                    label="Estado"
                                    options={estados}
                                />
                                <LibraryField
                                    name={`observacion_${item.id}`}
                                    label="Observación"
                                    placeholder="Detalle de la incidencia"
                                    required
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
