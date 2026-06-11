export interface HTTPOptions {
  headers?: Record<string, string>;
  data?: unknown;
  timeout?: number;
  credentials?: boolean;
}

function isFormData(value: unknown): value is FormData {
  return value instanceof FormData;
}

function queryStringify(data: Record<string, unknown>): string {
  const query = Object.entries(data)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join("&");
  return query.length ? `?${query}` : "";
}

export class HTTPTransport {
  constructor(private readonly baseUrl: string) {}

  public get<T>(path: string, options: HTTPOptions = {}): Promise<T> {
    return this.request<T>("GET", path, options);
  }

  public post<T>(path: string, options: HTTPOptions = {}): Promise<T> {
    return this.request<T>("POST", path, options);
  }

  public put<T>(path: string, options: HTTPOptions = {}): Promise<T> {
    return this.request<T>("PUT", path, options);
  }

  public delete<T>(path: string, options: HTTPOptions = {}): Promise<T> {
    return this.request<T>("DELETE", path, options);
  }

  private request<T>(
    method: string,
    path: string,
    options: HTTPOptions,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const isGet = method === "GET";
      const endpoint = `${this.baseUrl}${path}${
        isGet && options.data && !isFormData(options.data)
          ? queryStringify(options.data as Record<string, unknown>)
          : ""
      }`;

      xhr.open(method, endpoint, true);
      xhr.withCredentials = options.credentials === true;
      xhr.timeout = options.timeout ?? 20000;
      xhr.responseType = "text";

      const hasFormData = isFormData(options.data);
      const headers = options.headers ?? {};

      if (!hasFormData && !isGet && options.data !== undefined) {
        xhr.setRequestHeader("Content-Type", "application/json");
      }

      Object.entries(headers).forEach(([name, value]) => {
        xhr.setRequestHeader(name, value);
      });

      xhr.onload = () => {
        const raw = xhr.responseText;
        const isSuccess = xhr.status >= 200 && xhr.status < 300;

        const parseResponse = () => {
          if (!raw) return null as unknown;
          try {
            return JSON.parse(raw) as unknown;
          } catch {
            console.error(
              "Failed to parse JSON response:",
              raw.substring(0, 100),
            );
            return raw as unknown;
          }
        };

        if (isSuccess) {
          resolve(parseResponse() as T);
          return;
        }

        const parsed = parseResponse();
        let message = "Unknown error";

        if (parsed && typeof parsed === "object") {
          const obj = parsed as Record<string, unknown>;
          if ("reason" in obj) {
            message = String(obj.reason);
          } else if ("message" in obj) {
            message = String(obj.message);
          } else if ("error" in obj) {
            message = String(obj.error);
          }
        }

        if (!message || message === "Unknown error") {
          message = xhr.statusText || `HTTP ${xhr.status}`;
        }

        reject(new Error(message));
      };

      xhr.onerror = () => reject(new Error("Network error"));
      xhr.ontimeout = () => reject(new Error("Request timed out"));

      if (isGet || options.data === undefined) {
        xhr.send();
        return;
      }

      if (hasFormData) {
        xhr.send(options.data as Document | XMLHttpRequestBodyInit | null);
        return;
      }

      xhr.send(JSON.stringify(options.data));
    });
  }
}
