import { useEffect, useState, type TransitionEvent } from "react";

export function useFormDisclosureViewModel<T>(content: T | null) {
    const open = content !== null;
    const [panel, setPanel] = useState({ content, open, version: 0 });

    if (open !== panel.open || (open && content !== panel.content)) {
        setPanel({ content: content ?? panel.content, open, version: panel.version + Number(open && !panel.open) });
    }

    const exiting = !open && panel.content !== null;
    useEffect(() => {
        if (!exiting) return;
        const timeout = window.setTimeout(() => {
            setPanel((current) => current.open ? current : { ...current, content: null });
        }, 180);
        return () => window.clearTimeout(timeout);
    }, [exiting]);

    return {
        open,
        version: panel.version,
        content: panel.content,
        onTransitionEnd: (event: TransitionEvent<HTMLDivElement>) => {
            if (event.target === event.currentTarget && event.propertyName === "grid-template-rows"
                && event.currentTarget.getBoundingClientRect().height === 0) {
                setPanel((current) => current.open ? current : { ...current, content: null });
            }
        }
    };
}
