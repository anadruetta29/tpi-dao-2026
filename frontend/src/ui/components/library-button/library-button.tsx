import { type ComponentPropsWithoutRef } from "react";
import styles from "./style.module.css";

type Props = ComponentPropsWithoutRef<"button"> & {
    tone?: "primary" | "secondary" | "danger";
};

export function LibraryButton({ tone = "secondary", type = "button", className, ...props }: Props) {
    return <button type={type} className={[styles.button, styles[tone], className].filter(Boolean).join(" ")} {...props} />;
}
