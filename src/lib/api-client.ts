import type { AxiosRequestConfig } from "axios";
import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

interface ApiResponse<T> {
	data: T;
	error?: string | null;
}

interface ApiClient
	extends Omit<AxiosInstance, "get" | "post" | "put" | "delete" | "patch"> {
	get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
	post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
	put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
	delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
	patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
}

const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
	return config;
});

axiosInstance.interceptors.response.use(
	(response) => {
		const apiResponse = response.data as ApiResponse<any>;

		if (apiResponse.error) {
			return Promise.reject(new Error(apiResponse.error));
		}

		return apiResponse.data;
	},
	(error) => {
		console.error("API Error:", error);

		if (error.response?.status === 401) {
			console.warn("Session expired or invalid");
		}

		return Promise.reject(error);
	},
);

export const api = axiosInstance as unknown as ApiClient;
