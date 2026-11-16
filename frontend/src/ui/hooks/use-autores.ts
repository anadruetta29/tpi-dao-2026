import { useCallback, useEffect, useState } from "react";
import { type ActionState } from "@/core/types";
import { type Session } from "@/domain/entities/session";
import { getAllAutoresAction } from "@/ui/actions/autor/autor.actions";
import { pickData } from "@/ui/routes/use-library-records-viewmodel";

type AutorOption = {
    value: string;
    label: string;
};

type AuthorResult = ActionState<AutorOption[]>;

export function useAutores(session: Session) {
    const [result, setResult] = useState<{
        session: Session;
        data: AuthorResult;
    } | null>(null);

    const [revision, setRevision] = useState(0);

    useEffect(() => {
        let active = true;

        void getAllAutoresAction(session).then((response) => {
            if (!active) return;

            setResult({
                session,
                data: pickData(response, ({ autores }) =>
                    autores.map((autor) => ({
                        value: autor.id,
                        label: `${autor.nombre} ${autor.apellido}`.trim()
                    }))
                )
            });
        });

        return () => {
            active = false;
        };
    }, [session, revision]);

    const retry = useCallback(() => {
        setResult(null);
        setRevision((current) => current + 1);
    }, []);

    const authorResult = result?.session === session
        ? result.data
        : null;

    const options = authorResult?.data ?? [];

    const names = new Map(
        options.map(({ value, label }) => [value, label])
    );

    return {
        authorResult,
        authorOptions: options,
        authorNames: names,
        retryAuthors: retry
    };
}