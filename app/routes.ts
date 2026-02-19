import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("dulceria", "routes/candy-store.tsx"),
  route("pago", "routes/checkout.tsx"),
  route("confirmacion", "routes/confirmation.tsx"),
  route("mis-pedidos", "routes/orders.tsx"),
  route("api/complete", "routes/api.complete.ts"),
] satisfies RouteConfig;
