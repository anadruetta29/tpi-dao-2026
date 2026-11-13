import { ENV } from "../config/env";
import { type CacheConfig } from "../config/cache";

export class HTTPClient {

    private readonly baseUrl: string;

    constructor(baseUrl: string = ENV.API_URL) {
        this.baseUrl = baseUrl.replace(/\/+$/, "");
    }

    private buildUrl(path: string, params?: Record<string, any>): string {
        const normalizedPath = path.startsWith("http")
            ? path
            : `${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

        if (!params || Object.keys(params).length === 0) {
            return normalizedPath;
        }

        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null && value !== "") {
                searchParams.append(key, String(value));
            }
        }

        const queryString = searchParams.toString();
        if (!queryString) return normalizedPath;

        return normalizedPath.includes("?")
            ? `${normalizedPath}&${queryString}`
            : `${normalizedPath}?${queryString}`;
    }

    private buildHeaders(accessToken?: string | null, extraHeaders?: Record<string, string>): HeadersInit {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...extraHeaders
        };

        if (accessToken) {
            headers["Authorization"] = `Bearer ${accessToken}`;
        }

        return headers;
    }

    private async parseResponse<T = any>(response: Response): Promise<T> {
        const contentType = response.headers.get("content-type") || "";
        const isJson = contentType.includes("application/json");
        const data = isJson ? await response.json().catch(() => null) : await response.text().catch(() => null);

        if (!response.ok) {
            const message =
                (data && typeof data === "object" && (data.detail || data.message || data.error)) ||
                `Error HTTP ${response.status}: ${response.statusText}`;

            const error: any = new Error(typeof message === "string" ? message : JSON.stringify(message));
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data as T;
    }

    public async get<T = any>(
        url: string,
        params: Record<string, any> = {},
        accessToken?: string | null,
        _cacheConfig?: CacheConfig
    ): Promise<T> {
        const fullUrl = this.buildUrl(url, params);
        const response = await fetch(fullUrl, {
            method: "GET",
            headers: this.buildHeaders(accessToken)
        });

        return await this.parseResponse<T>(response);
    }

    public async post<T = any>(
        url: string,
        body: Record<string, any> = {},
        accessToken?: string | null,
        _cacheConfig?: CacheConfig
    ): Promise<T> {
        const fullUrl = this.buildUrl(url);
        const response = await fetch(fullUrl, {
            method: "POST",
            headers: this.buildHeaders(accessToken),
            body: JSON.stringify(body)
        });

        return await this.parseResponse<T>(response);
    }

    public async put<T = any>(
        url: string,
        body: Record<string, any> = {},
        accessToken?: string | null,
        _cacheConfig?: CacheConfig
    ): Promise<T> {
        const fullUrl = this.buildUrl(url);
        const response = await fetch(fullUrl, {
            method: "PUT",
            headers: this.buildHeaders(accessToken),
            body: JSON.stringify(body)
        });

        return await this.parseResponse<T>(response);
    }

    public async patch<T = any>(
        url: string,
        body: Record<string, any> = {},
        accessToken?: string | null,
        _cacheConfig?: CacheConfig
    ): Promise<T> {
        const fullUrl = this.buildUrl(url);
        const response = await fetch(fullUrl, {
            method: "PATCH",
            headers: this.buildHeaders(accessToken),
            body: JSON.stringify(body)
        });

        return await this.parseResponse<T>(response);
    }

    public async delete<T = any>(
        url: string,
        params: Record<string, any> = {},
        accessToken?: string | null,
        _cacheConfig?: CacheConfig
    ): Promise<T> {
        const fullUrl = this.buildUrl(url, params);
        const response = await fetch(fullUrl, {
            method: "DELETE",
            headers: this.buildHeaders(accessToken)
        });

        return await this.parseResponse<T>(response);
    }

}
