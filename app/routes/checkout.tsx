import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { useNavigate, Navigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { processPayment } from "@/services/payU";
import { completeTransaction } from "@/services/complete";
import { saveOrder } from "@/services/orders";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { usePaymentStore } from "@/store/paymentStore";
import { formatCurrency } from "@/utils/formatCurrency";
import type { Route } from "./+types/checkout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Cineplanet — Pago" },
    { name: "description", content: "Completa tu pago de forma segura" },
  ];
}

const schema = z
  .object({
    cardNumber: z
      .string()
      .regex(/^\d{4} \d{4} \d{4} \d{4}$/, "Número de tarjeta inválido"),
    cardExpiry: z
      .string()
      .regex(/^\d{2}\/\d{2}$/, "Formato MM/YY")
      .refine((val) => {
        const [mm, yy] = val.split("/");
        const month = parseInt(mm, 10);
        const year = parseInt(yy, 10);
        if (month < 1 || month > 12) return false;
        return new Date(2000 + year, month) > new Date();
      }, "Tarjeta vencida"),
    cvv: z.string().regex(/^\d{3,4}$/, "CVV inválido"),
    email: z.string().email("Correo electrónico inválido"),
    fullName: z.string().min(3, "Ingresa tu nombre completo"),
    documentType: z.enum(["DNI", "CE", "Pasaporte"]),
    documentNumber: z.string().min(1, "Ingresa tu número de documento"),
  })
  .superRefine((data, ctx) => {
    const n = data.documentNumber.replace(/\s/g, "");
    if (data.documentType === "DNI" && !/^\d{8}$/.test(n)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "DNI debe tener exactamente 8 dígitos",
        path: ["documentNumber"],
      });
    }
    if (data.documentType === "CE" && !/^[A-Z0-9]{9,12}$/i.test(n)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CE debe tener entre 9 y 12 caracteres alfanuméricos",
        path: ["documentNumber"],
      });
    }
    if (data.documentType === "Pasaporte" && !/^[A-Z]{1,2}\d{6,8}$/i.test(n)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pasaporte inválido (ej: C12345678)",
        path: ["documentNumber"],
      });
    }
  });

type FormValues = z.infer<typeof schema>;

const inputClass =
  "w-full rounded-lg bg-cp-gray-light px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-cp-red";

const selectClass =
  "w-full rounded-lg bg-cp-gray-light px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cp-red";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-cp-red">{error}</p>}
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user, hydrated } = useAuthStore();
  const { items, total, clearCart } = useCartStore();

  if (!hydrated) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (items.length === 0) return <Navigate to="/dulceria" replace />;
  const { setPayUResponse } = usePaymentStore();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: user?.email ?? "",
      fullName: user?.name ?? "",
      documentType: "DNI",
    },
  });

  const documentType = watch("documentType");

  const docConfig: Record<string, { maxLength: number; inputMode: "numeric" | "text" }> = {
    DNI: { maxLength: 8, inputMode: "numeric" },
    CE: { maxLength: 12, inputMode: "text" },
    Pasaporte: { maxLength: 9, inputMode: "text" },
  };

  useEffect(() => {
    setValue("documentNumber", "");
  }, [documentType]);

  const handleDocNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (documentType === "DNI") {
      value = value.replace(/\D/g, "").slice(0, 8);
    } else if (documentType === "CE") {
      value = value.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 12);
    } else if (documentType === "Pasaporte") {
      value = value.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 9);
    }
    setValue("documentNumber", value, { shouldValidate: false });
  };

  const handleCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(" ") ?? raw;
    setValue("cardNumber", formatted, { shouldValidate: false });
  };

  const handleExpiry = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length > 2) raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    setValue("cardExpiry", raw, { shouldValidate: false });
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payUResponse = await processPayment({
        cardNumber: data.cardNumber.replace(/\s/g, ""),
        cardExpiry: data.cardExpiry,
        cvv: data.cvv,
        email: data.email,
        fullName: data.fullName,
        amount: total,
        documentNumber: data.documentNumber,
        documentType: data.documentType,
      });

      await completeTransaction({
        email: data.email,
        nombres: data.fullName,
        documentNumber: data.documentNumber,
        operationDate: payUResponse.operationDate,
        transactionId: payUResponse.transactionId,
      });

      saveOrder({ user, items, total, payUResponse })
        .then(() => queryClient.invalidateQueries({ queryKey: ["orders"] }))
        .catch(() => {});

      setPayUResponse(payUResponse);
      clearCart();
      navigate("/confirmacion");
    } catch {
      toast.error("No se pudo procesar el pago. Intenta de nuevo.");
    }
  });

  const docPlaceholder: Record<string, string> = {
    DNI: "12345678",
    CE: "123456789",
    Pasaporte: "AB1234567",
  };

  return (
    <main className="container mx-auto px-4 py-6 md:py-10">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 md:mb-8">
        <span className="text-cp-red">Pago</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <form onSubmit={onSubmit} className="lg:col-span-2 order-2 lg:order-1 flex flex-col gap-6 md:gap-8">
          <section className="bg-cp-gray rounded-2xl p-4 sm:p-6 flex flex-col gap-5">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-400">
              Datos de la tarjeta
            </h2>

            <Field label="Número de tarjeta" error={errors.cardNumber?.message}>
              <input
                {...register("cardNumber")}
                onChange={handleCardNumber}
                placeholder="0000 0000 0000 0000"
                inputMode="numeric"
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Field label="Vencimiento" error={errors.cardExpiry?.message}>
                <input
                  {...register("cardExpiry")}
                  onChange={handleExpiry}
                  placeholder="MM/YY"
                  inputMode="numeric"
                  className={inputClass}
                />
              </Field>

              <Field label="CVV" error={errors.cvv?.message}>
                <input
                  {...register("cvv")}
                  placeholder="123"
                  inputMode="numeric"
                  maxLength={4}
                  className={inputClass}
                />
              </Field>
            </div>
          </section>

          <section className="bg-cp-gray rounded-2xl p-4 sm:p-6 flex flex-col gap-5">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-400">
              Datos personales
            </h2>

            <Field label="Nombre completo" error={errors.fullName?.message}>
              <input
                {...register("fullName")}
                placeholder="Juan Pérez"
                className={inputClass}
              />
            </Field>

            <Field label="Correo electrónico" error={errors.email?.message}>
              <input
                {...register("email")}
                type="email"
                placeholder="correo@ejemplo.com"
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
              <Field label="Tipo de documento" error={errors.documentType?.message}>
                <select {...register("documentType")} className={selectClass}>
                  <option value="DNI">DNI</option>
                  <option value="CE">CE</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </Field>

              <Field label="Número de documento" error={errors.documentNumber?.message}>
                <input
                  {...register("documentNumber")}
                  onChange={handleDocNumber}
                  placeholder={docPlaceholder[documentType] ?? ""}
                  inputMode={docConfig[documentType]?.inputMode ?? "text"}
                  maxLength={docConfig[documentType]?.maxLength}
                  className={inputClass}
                />
              </Field>
            </div>
          </section>
        </form>

        <aside className="order-1 lg:order-2 flex flex-col gap-4">
          <div className="bg-cp-gray rounded-2xl p-4 sm:p-6 flex flex-col gap-4">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-400">
              Resumen
            </h2>

            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-300">
                    {item.nombre}
                    <span className="text-gray-500 ml-1">x{item.cantidad}</span>
                  </span>
                  <span className="font-medium">
                    {formatCurrency(item.precio * item.cantidad)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t border-white/10 pt-3 flex justify-between">
              <span className="text-gray-400 text-sm">Total</span>
              <span className="font-bold text-lg">{formatCurrency(total)}</span>
            </div>

            <button
              onClick={onSubmit}
              disabled={isSubmitting || items.length === 0}
              className="w-full py-4 rounded-xl bg-cp-red hover:bg-cp-red-dark text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Procesando..." : `Pagar ${formatCurrency(total)}`}
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
