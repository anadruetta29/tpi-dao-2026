import { ErrorMessages } from "./errors";
import { SuccessMessages } from "./success";

export { ErrorMessages, SuccessMessages };

export class ErrorHandler {

    public static handleError(error: any): Error {
        if (error instanceof Error) {
            return error;
        }

        if (typeof error === "string") {
            return new Error(error);
        }

        const message =
            error?.data?.detail ||
            error?.data?.message ||
            error?.message ||
            ErrorMessages.UNEXPECTED_ERROR;

        return new Error(typeof message === "string" ? message : ErrorMessages.UNEXPECTED_ERROR);
    }

}
