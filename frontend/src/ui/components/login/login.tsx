import { LibraryBrand } from "@/ui/components/library-brand/library-brand";
import { LibraryStatus } from "@/ui/components/library-status/library-status";
import { LoginForm } from "@/ui/components/login-form/login-form";
import styles from "./style.module.css";
import type { FormEventHandler } from "react";

type Props = {
    error: string | null 
    isLoading: boolean
    onSubmit: FormEventHandler<HTMLFormElement>
}
export function Login( { error, isLoading, onSubmit}: Props ) {

    return (
        <main className={styles.page}>
            <div className={styles.cover}>
                <LibraryBrand />
                <div className={styles.art} aria-hidden="true">
                    <div className={styles.orbit} />
                    <div className={styles.books}>
                        <span className={styles.first} /><span className={styles.second} /><span className={styles.third} /><span className={styles.fourth} />
                    </div>
                </div>
                <p className={styles.tagline}>Gestión de bibliotecas</p>
            </div>
            <div className={styles.body}>
                <div className={styles.mobileBrand}><LibraryBrand /></div>
                <section aria-labelledby="login-title" className={styles.content}>
                    <h1 id="login-title">Iniciá sesión</h1>
                    <p className={styles.hint}>Ingresá con tu cuenta de la biblioteca.</p>
                    {error && <LibraryStatus kind="error">{error}</LibraryStatus>}
                    <LoginForm isLoading={isLoading} onSubmit={onSubmit} />
                </section>
            </div>
        </main>
    );
}
