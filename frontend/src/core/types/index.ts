export interface ActionState<T = any> {
    success: boolean;
    data?: T;
    error?: string | null;
    message?: string | null;
}
