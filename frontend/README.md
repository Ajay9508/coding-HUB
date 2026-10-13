# CodingHub frontend

React 19 and Vite frontend for the CodingHub application. For full local setup, environment configuration, route documentation, and Docker instructions, see the [project README](../README.md).

```powershell
npm.cmd ci
npm.cmd run dev
npm.cmd run lint
npm.cmd run build
```

Vite proxies `/api` requests to `http://localhost:5000` in development. Set `VITE_API_URL` only when the API is served from a different base URL.
