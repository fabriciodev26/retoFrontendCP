export interface Premiere {
  id: number;
  titulo: string;
  imagen: string;
  descripcion: string;
}

export interface CandyProduct {
  id: number;
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
