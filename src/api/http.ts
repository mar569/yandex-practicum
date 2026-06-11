import { HTTPTransport } from "@/core/HTTPTransport";

// Use relative URL during development (goes through Vite proxy)
// Use absolute URL in production
const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isDev ? '/api/v2' : 'https://ya-praktikum.tech/api/v2';

export const http = new HTTPTransport(API_BASE_URL);
