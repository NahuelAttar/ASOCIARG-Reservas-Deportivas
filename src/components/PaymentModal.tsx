import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Reservation, PaymentMethod } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
  onConfirmPayment: (
    reservationId: string,
    paymentMethod: PaymentMethod,
    amount: number,
    customPaymentMethod?: string
  ) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  reservation,
  onConfirmPayment,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');
  const [customMethodText, setCustomMethodText] = useState<string>('');
  const [amount, setAmount] = useState<number>(reservation?.price || 12000);
  const [amountDisplay, setAmountDisplay] = useState<string>(
    (reservation?.price || 12000).toLocaleString('es-AR')
  );

  // Sync state when reservation opens
  React.useEffect(() => {
    if (reservation) {
      setAmount(reservation.price);
      setAmountDisplay(reservation.price.toLocaleString('es-AR'));
      setPaymentMethod('Efectivo');
      setCustomMethodText('');
    }
  }, [reservation]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setAmount(0);
      setAmountDisplay('');
      return;
    }
    const val = parseInt(raw, 10);
    setAmount(val);
    setAmountDisplay(val.toLocaleString('es-AR'));
  };

  if (!reservation) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'Otro' && !customMethodText.trim()) {
      alert('Por favor especificá el medio de pago.');
      return;
    }
    onConfirmPayment(
      reservation.id,
      paymentMethod,
      Number(amount) || reservation.price,
      paymentMethod === 'Otro' ? customMethodText.trim() : undefined
    );
    onClose();
  };

  const methods: { id: PaymentMethod; label: string; icon: string }[] = [
    { id: 'Efectivo', label: 'Efectivo', icon: 'payments' },
    { id: 'Transferencia', label: 'Transferencia', icon: 'account_balance' },
    { id: 'QR / Mercado Pago', label: 'QR / Mercado Pago', icon: 'qr_code_scanner' },
    { id: 'Tarjeta', label: 'Tarjeta', icon: 'credit_card' },
    { id: 'Otro', label: 'Otro', icon: 'more_horiz' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/90 z-10"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                  point_of_sale
                </span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 tracking-tight">Cobrar Turno</h3>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Registro de cobranza en recepción
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-xs">
              {/* Resumen del turno */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Reservante
                  </span>
                  <span className="font-bold text-slate-900 text-xs">
                    {reservation.person.name}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Cancha
                  </span>
                  <span className="text-slate-700 font-semibold text-xs">
                    {reservation.courtName}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Fecha y Horario
                  </span>
                  <span className="text-slate-700 font-semibold text-xs tabular-nums">
                    {reservation.date} · {reservation.startTime} a {reservation.endTime} hs
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 mt-0.5">
                  <span className="text-xs font-bold text-slate-700">
                    Total a cobrar:
                  </span>
                  <span className="text-lg font-black text-slate-900 tabular-nums">
                    ${reservation.price.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              {/* Selector de medio de pago: Efectivo, Transferencia, QR / Mercado Pago, Tarjeta, Otro */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold uppercase tracking-wider text-[10px] text-slate-500">
                  Seleccionar medio de pago
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {methods.map((m) => (
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border text-left ${
                        paymentMethod === m.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[17px] ${
                        paymentMethod === m.id ? 'text-white' : 'text-slate-400'
                      }`}>
                        {m.icon}
                      </span>
                      <span className="truncate">{m.label}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Si selecciona "Otro", campo de texto para escribir manualmente */}
                <AnimatePresence>
                  {paymentMethod === 'Otro' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col gap-1 mt-1 overflow-hidden"
                    >
                      <label className="font-bold uppercase tracking-wider text-[10px] text-slate-500">
                        Otro medio de pago (especificar) *
                      </label>
                      <input
                        type="text"
                        autoFocus
                        required
                        value={customMethodText}
                        onChange={(e) => setCustomMethodText(e.target.value)}
                        placeholder="Ej: Canje, Cuenta corriente, Cheque..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-[#0D5FAE]"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Ajuste de importe si aplica */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold uppercase tracking-wider text-[10px] text-slate-500">
                    Importe cobrado ($)
                  </label>
                  {amount !== reservation.price && (
                    <button
                      type="button"
                      onClick={() => {
                        setAmount(reservation.price);
                        setAmountDisplay(reservation.price.toLocaleString('es-AR'));
                      }}
                      className="text-[10px] text-[#0D5FAE] hover:underline font-semibold cursor-pointer"
                    >
                      Restablecer (${reservation.price.toLocaleString('es-AR')})
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amountDisplay}
                  placeholder="0"
                  onChange={handleAmountChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-extrabold text-slate-900 focus:outline-none focus:bg-white focus:border-[#0D5FAE] tabular-nums"
                />
              </div>

              {/* Botones de acción */}
              <div className="pt-2 flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer text-center transition-colors"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer text-center transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  <span>Confirmar cobro</span>
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
