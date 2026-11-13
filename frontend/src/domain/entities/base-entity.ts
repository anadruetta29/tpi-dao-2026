export abstract class BaseEntity {

    // ======== Serialization ======== //

    public toJSON(): Record<string, any> {
        const plain: Record<string, any> = {};

        for (const [key, value] of Object.entries(this)) {
            if (typeof value === "function" || key.startsWith("_")) {
                continue;
            }

            if (value && typeof (value as any).toJSON === "function") {
                plain[key] = (value as any).toJSON();
            } else if (value && typeof (value as any).toPlainObject === "function") {
                plain[key] = (value as any).toPlainObject();
            } else if (Array.isArray(value)) {
                plain[key] = value.map((item) => {
                    if (item && typeof item.toJSON === "function") return item.toJSON();
                    if (item && typeof item.toPlainObject === "function") return item.toPlainObject();
                    return item;
                });
            } else {
                plain[key] = value;
            }
        }

        return plain;
    }

    public toPlainObject(): Record<string, any> {
        return this.toJSON();
    }

}