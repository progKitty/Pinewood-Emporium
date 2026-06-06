export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("auth_token");
  
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Handle token expiration or unauthorized
      localStorage.removeItem("accessToken");
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "API Request Failed");
  }

  // Handle empty responses (like 204 No Content)
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) => fetchApi(endpoint, { ...options, method: 'GET' }) as Promise<T>,
  post: <T>(endpoint: string, data?: any, options?: RequestInit) => fetchApi(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) }) as Promise<T>,
  put: <T>(endpoint: string, data?: any, options?: RequestInit) => fetchApi(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) }) as Promise<T>,
  patch: <T>(endpoint: string, data?: any, options?: RequestInit) => fetchApi(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(data) }) as Promise<T>,
  delete: <T>(endpoint: string, options?: RequestInit) => fetchApi(endpoint, { ...options, method: 'DELETE' }) as Promise<T>,
};
