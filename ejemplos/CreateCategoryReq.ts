import { Session } from "@/domain/entities/session";

export interface CreateCategoryReq {
    session: Session;
    name: string;
    slug: string;
    image?: string | null;
    subcategoryIds?: string[];
}
