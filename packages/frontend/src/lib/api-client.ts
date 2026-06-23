interface ApiError {
  status: number;
  title: string;
  detail: string;
  errors?: Record<string, string>;
}

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly title: string,
    public readonly detail: string,
    public readonly errors?: Record<string, string>,
  ) {
    super(detail);
    this.name = "ApiClientError";
  }
}

function getCsrfToken(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
    throw new ApiClientError(401, "Unauthorized", "認証が必要です");
  }
  if (!response.ok) {
    const body = (await response.json()) as ApiError;
    throw new ApiClientError(response.status, body.title, body.detail, body.errors);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

function mutationHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const csrf = getCsrfToken();
  if (csrf) {
    headers["X-XSRF-TOKEN"] = csrf;
  }
  return headers;
}

export const apiClient = {
  get<T>(path: string): Promise<T> {
    return fetch(path, {
      credentials: "include",
      headers: { Accept: "application/json" },
    }).then(handleResponse<T>);
  },

  post<T>(path: string, body?: unknown): Promise<T> {
    return fetch(path, {
      method: "POST",
      credentials: "include",
      headers: mutationHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    }).then(handleResponse<T>);
  },

  put<T>(path: string, body: unknown): Promise<T> {
    return fetch(path, {
      method: "PUT",
      credentials: "include",
      headers: mutationHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse<T>);
  },

  patch<T>(path: string, body?: unknown): Promise<T> {
    return fetch(path, {
      method: "PATCH",
      credentials: "include",
      headers: mutationHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    }).then(handleResponse<T>);
  },

  delete<T>(path: string): Promise<T> {
    const headers: Record<string, string> = { Accept: "application/json" };
    const csrf = getCsrfToken();
    if (csrf) {
      headers["X-XSRF-TOKEN"] = csrf;
    }
    return fetch(path, {
      method: "DELETE",
      credentials: "include",
      headers,
    }).then(handleResponse<T>);
  },
};
