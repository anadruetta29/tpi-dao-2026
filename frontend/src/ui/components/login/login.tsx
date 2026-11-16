import { type FormEventHandler } from "react";
import { LibraryBrand } from "@/ui/components/library-brand/library-brand";
import { LibraryStatus } from "@/ui/components/library-status/library-status";
import { LoginForm } from "@/ui/components/login-form/login-form";
import type { LibraryFieldProps } from "@/ui/components/library-field/library-field";
import type { ThemeView } from "@/ui/layout/viewmodel";
import { LibraryThemeButton } from "@/ui/components/library-theme-button/library-theme-button";
import styles from "./style.module.css";

type Props = {
    error: string | null
    isLoading: boolean
    fields: LibraryFieldProps[]
    theme: ThemeView
    onSubmit: FormEventHandler<HTMLFormElement>
}

export function Login({ error, isLoading, fields, onSubmit, theme }: Props) {
    return (
        <main className={styles.page}>
            <article className={styles.card} aria-labelledby="login-title">
                <div className={styles.body}>
                    <div className={styles.brandRow}><LibraryBrand /><LibraryThemeButton {...theme} /></div>
                    <div className={styles.intro}>
                        <h1 id="login-title">Iniciá sesión</h1>
                        <p>Ingresá con tu cuenta de la biblioteca.</p>
                    </div>
                    {error && <LibraryStatus kind="error">{error}</LibraryStatus>}
                    <LoginForm fields={fields} isLoading={isLoading} onSubmit={onSubmit} />
                </div>
                <div className={styles.cover} aria-hidden="true">
                    <div className={styles.art}>
                        <span className={styles.book} />
                        <span className={styles.book} />
                        <span className={styles.book} />
                        <span className={styles.book} />
                    </div>
                </div>
            </article>
        </main>
    );
}

export function SessionLoading() {
    return (
        <main className={styles.page}>
            <div className={styles.session}><LibraryBrand /><LibraryStatus>Verificando sesión...</LibraryStatus></div>
        </main>
    );
}
