// Automatically switch between local development and production URLs.
// import.meta.env.DEV is true when running `npm run dev` and false when running `npm run build`.
export const API_URL = import.meta.env.DEV
    ? 'http://localhost:5000/api'
    : 'https://vybe-admin.onrender.com/api';
