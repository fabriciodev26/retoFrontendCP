export interface Premiere {
  id: string;
  titulo: string;
  imagen: string;
  descripcion: string;
}

export interface CandyProduct {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
}

export interface CartItem extends CandyProduct {
  cantidad: number;
}

export interface User {
  name: string;
  email: string;
}

export interface PayUResponse {
  operationDate: string;
  transactionId: string;
}

export type DocumentType = "DNI" | "CE" | "Pasaporte";

export interface Order {
  id: string;
  user: User;
  items: CartItem[];
  total: number;
  payUResponse: PayUResponse;
  createdAt: string;
}
