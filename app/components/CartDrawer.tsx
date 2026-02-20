import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/utils/formatCurrency";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const navigate = useNavigate();
  const { items, total, addItem, removeItem, removeItemFull, clearCart } = useCartStore();
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    if (!open) {
      setConfirmClear(false);
      return;
    }
    document.body.style.overflow = "hidden";
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open, onClose]);

  const handlePagar = () => {
    navigate("/pago");
    onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className={`fixed right-0 top-0 z-50 h-full w-full sm:w-96 bg-cp-gray flex flex-col shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <CartIcon />
            <h2 className="font-semibold text-base">Carrito</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerrar carrito"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500 px-6 text-center">
              <EmptyCartIcon />
              <p className="text-sm">Tu carrito está vacío</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/10">
              {items.map((item) => (
                <li key={item.id} className="px-5 py-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-snug">{item.nombre}</p>
                      {item.descripcion && (
                        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed line-clamp-2">
                          {item.descripcion}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-bold shrink-0">
                      {formatCurrency(item.precio * item.cantidad)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-8 h-8 rounded-lg bg-cp-gray-light text-white font-bold hover:bg-white/20 transition-colors text-lg leading-none"
                        aria-label={`Quitar uno de ${item.nombre}`}
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm font-semibold">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => addItem(item)}
                        className="w-8 h-8 rounded-lg bg-cp-red hover:bg-cp-red-dark text-white font-bold transition-colors text-lg leading-none"
                        aria-label={`Agregar uno de ${item.nombre}`}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItemFull(item.id)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-cp-red hover:bg-white/5 transition-colors"
                      aria-label={`Eliminar ${item.nombre}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="shrink-0 border-t border-white/10 px-5 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Total pagado</span>
              <span className="text-lg font-bold">{formatCurrency(total)}</span>
            </div>

            {confirmClear ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-300 text-center">¿Seguro que quieres limpiar el carrito?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-300 text-sm font-medium hover:border-white/30 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => { clearCart(); setConfirmClear(false); }}
                    className="flex-1 py-2.5 rounded-xl bg-cp-red hover:bg-cp-red-dark text-white text-sm font-medium transition-colors"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmClear(true)}
                  className="py-2.5 px-4 rounded-xl border border-white/10 text-gray-400 text-sm font-medium hover:border-white/30 hover:text-white transition-colors"
                >
                  Limpiar
                </button>
                <button
                  onClick={handlePagar}
                  disabled={items.length === 0}
                  className="flex-1 py-2.5 rounded-xl bg-cp-red hover:bg-cp-red-dark text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pagar {formatCurrency(total)}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function EmptyCartIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
