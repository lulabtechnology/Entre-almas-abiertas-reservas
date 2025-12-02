"use client";

import { useState, FormEvent, useMemo } from "react";

const HOURLY_RATE = 60;

const HOURS = Array.from({ length: 12 }, (_, i) => 8 + i); // 8 → 19

function formatHour(h: number) {
  return `${h.toString().padStart(2, "0")}:00`;
}

export default function ReservaPage() {
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [comentario, setComentario] = useState("");
  const [fecha, setFecha] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [duracionHoras, setDuracionHoras] = useState(1);
  const [isWeekend, setIsWeekend] = useState(false);

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const total = useMemo(() => HOURLY_RATE * duracionHoras, [duracionHoras]);

  function handleFechaChange(value: string) {
    setFecha(value);
    setErrorMessage(null);
    setStatus("idle");

    if (!value) {
      setIsWeekend(false);
      return;
    }

    const [year, month, day] = value.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    const dayOfWeek = d.getDay(); // 0 domingo, 6 sábado

    setIsWeekend(dayOfWeek === 0 || dayOfWeek === 6);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setStatus("idle");

    if (!nombre || !email || !telefono || !fecha || !horaInicio) {
      setErrorMessage("Por favor completa todos los campos obligatorios.");
      return;
    }

    if (isWeekend) {
      setErrorMessage(
        "Las reservas de fin de semana se gestionan por WhatsApp. Escríbele directamente a Aureya."
      );
      return;
    }

    setStatus("submitting");

    try {
      // Aquí MÁS ADELANTE conectaremos con /api/reservas (Firestore).
      // De momento solo simulamos el éxito para que la UI quede lista.
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStatus("success");

      // Limpiamos parcialmente el formulario, excepto nombre/email si quieres.
      setEdad("");
      setTelefono("");
      setWhatsapp("");
      setComentario("");
      setFecha("");
      setHoraInicio("");
      setDuracionHoras(1);
      setIsWeekend(false);
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(
        err?.message || "Ocurrió un error al intentar registrar tu reserva."
      );
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-ea-hero text-ea-soft">
      {/* Orbes de luz suaves de fondo */}
      <div className="hero-orb hero-orb--gold -top-10 -left-10 opacity-50" />
      <div className="hero-orb hero-orb--lilac top-32 -right-16 opacity-45" />
      <div className="hero-orb hero-orb--soft bottom-0 left-1/2 -translate-x-1/2 opacity-35" />

      {/* CONTENIDO */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-12">
        <div className="section-container">
          <div className="mx-auto max-w-3xl">
            {/* Encabezado suave */}
            <div className="mb-6 text-center">
              <p className="text-[0.6rem] uppercase tracking-[0.32em] text-ea-soft-muted">
                Entre Almas · Acompañamiento humano
              </p>
              <h1 className="mt-3 font-display text-2xl text-ea-soft sm:text-3xl">
                Reserva tu sesión con{" "}
                <span className="bg-gradient-to-r from-ea-gold-soft via-ea-gold to-ea-accent-soft bg-clip-text text-transparent">
                  Aureya
                </span>
                .
              </h1>
              <p className="mt-2 text-xs leading-relaxed text-ea-soft-muted sm:text-sm">
                Elige el día, la hora y cuántas horas deseas. Cada sesión tiene una
                duración de 1 hora y una inversión de{" "}
                <span className="font-semibold text-ea-gold">60 USD</span> por hora.
              </p>
            </div>

            {/* Tarjeta con formulario único */}
            <div className="glass-card relative overflow-hidden p-5 sm:p-7">
              {/* Pequeños destellos decorativos */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-ea-gold/15 blur-3xl" />
              <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-ea-accent/18 blur-3xl" />

              <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
                {/* Datos de la persona */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-ea-soft">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full rounded-2xl border border-ea-border bg-black/40 px-3 py-2 text-sm text-ea-soft outline-none placeholder:text-ea-soft-muted/60 focus:border-ea-gold focus:ring-1 focus:ring-ea-gold/60"
                      placeholder="Cómo te gustaría que te nombre"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-ea-soft">
                      Edad *
                    </label>
                    <input
                      type="number"
                      min={12}
                      max={120}
                      value={edad}
                      onChange={(e) => setEdad(e.target.value)}
                      className="w-full rounded-2xl border border-ea-border bg-black/40 px-3 py-2 text-sm text-ea-soft outline-none placeholder:text-ea-soft-muted/60 focus:border-ea-gold focus:ring-1 focus:ring-ea-gold/60"
                      placeholder="Tu edad"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-ea-soft">
                      Correo electrónico *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-ea-border bg-black/40 px-3 py-2 text-sm text-ea-soft outline-none placeholder:text-ea-soft-muted/60 focus:border-ea-gold focus:ring-1 focus:ring-ea-gold/60"
                      placeholder="Para enviarte la información de la sesión"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-ea-soft">
                      Número de teléfono *
                    </label>
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className="w-full rounded-2xl border border-ea-border bg-black/40 px-3 py-2 text-sm text-ea-soft outline-none placeholder:text-ea-soft-muted/60 focus:border-ea-gold focus:ring-1 focus:ring-ea-gold/60"
                      placeholder="Teléfono de contacto"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-ea-soft">
                    WhatsApp (si es distinto al teléfono)
                  </label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full rounded-2xl border border-ea-border bg-black/40 px-3 py-2 text-sm text-ea-soft outline-none placeholder:text-ea-soft-muted/60 focus:border-ea-gold focus:ring-1 focus:ring-ea-gold/60"
                    placeholder="Si usas otro número para WhatsApp, escríbelo aquí"
                  />
                  <p className="text-[0.7rem] text-ea-soft-muted">
                    Si lo dejas vacío, se tomará tu teléfono principal para contactarte.
                  </p>
                </div>

                {/* Qué quiere trabajar */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-ea-soft">
                    ¿Qué te gustaría trabajar en la sesión? (opcional)
                  </label>
                  <textarea
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    rows={3}
                    className="w-full rounded-2xl border border-ea-border bg-black/40 px-3 py-2 text-sm text-ea-soft outline-none placeholder:text-ea-soft-muted/60 focus:border-ea-gold focus:ring-1 focus:ring-ea-gold/60"
                    placeholder="Puedes compartir brevemente qué estás viviendo, qué te trae a este espacio o qué necesitas ahora."
                  />
                </div>

                {/* Fecha / hora / duración */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-ea-soft">
                      Fecha de la sesión *
                    </label>
                    <input
                      type="date"
                      value={fecha}
                      onChange={(e) => handleFechaChange(e.target.value)}
                      className="w-full rounded-2xl border border-ea-border bg-black/40 px-3 py-2 text-sm text-ea-soft outline-none focus:border-ea-gold focus:ring-1 focus:ring-ea-gold/60"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-ea-soft">
                      Hora de inicio *
                    </label>
                    <select
                      value={horaInicio}
                      onChange={(e) => setHoraInicio(e.target.value)}
                      className="w-full rounded-2xl border border-ea-border bg-black/40 px-3 py-2 text-sm text-ea-soft outline-none focus:border-ea-gold focus:ring-1 focus:ring-ea-gold/60 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isWeekend}
                      required
                    >
                      <option value="">Selecciona una hora</option>
                      {HOURS.map((h) => (
                        <option key={h} value={formatHour(h)}>
                          {formatHour(h)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-ea-soft">
                      Duración (horas seguidas) *
                    </label>
                    <select
                      value={duracionHoras}
                      onChange={(e) => setDuracionHoras(Number(e.target.value))}
                      className="w-full rounded-2xl border border-ea-border bg-black/40 px-3 py-2 text-sm text-ea-soft outline-none focus:border-ea-gold focus:ring-1 focus:ring-ea-gold/60 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isWeekend}
                    >
                      <option value={1}>1 hora</option>
                      <option value={2}>2 horas</option>
                      <option value={3}>3 horas</option>
                    </select>
                  </div>
                </div>

                {/* Mensaje para fines de semana */}
                {isWeekend && (
                  <div className="rounded-2xl border border-ea-gold/40 bg-ea-gold/5 p-3 text-xs text-ea-soft">
                    <p className="font-medium text-ea-gold-soft">
                      Fines de semana (sábado y domingo)
                    </p>
                    <p className="mt-1 text-ea-soft-muted">
                      Las reservas de fin de semana se coordinan directamente por
                      WhatsApp. Por favor, escribe a{" "}
                      <span className="font-semibold text-ea-gold">
                        +507 6215-9551
                      </span>{" "}
                      para acordar tu horario.
                    </p>
                  </div>
                )}

                {/* Resumen de precio */}
                <div className="flex flex-col gap-3 rounded-2xl border border-ea-border bg-black/40 p-3 text-xs sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[0.7rem] uppercase tracking-[0.22em] text-ea-soft-muted">
                      Resumen
                    </p>
                    <p className="mt-1 text-ea-soft">
                      {duracionHoras} hora
                      {duracionHoras > 1 ? "s" : ""} ·{" "}
                      <span className="font-semibold text-ea-gold">
                        {HOURLY_RATE} USD / hora
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[0.7rem] uppercase tracking-[0.22em] text-ea-soft-muted">
                      Total estimado
                    </p>
                    <p className="mt-1 text-lg font-semibold text-ea-gold">
                      {total} USD
                    </p>
                  </div>
                </div>

                {/* Mensajes de error / éxito */}
                {errorMessage && (
                  <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-100">
                    {errorMessage}
                  </div>
                )}

                {status === "success" && !errorMessage && (
                  <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs text-emerald-100">
                    Gracias por tu reserva. La misma Aureya te contactará pronto para
                    confirmar tu sesión y coordinar los detalles.
                  </div>
                )}

                {/* Botón de envío */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={status === "submitting" || isWeekend}
                    className="flex w-full items-center justify-center rounded-full bg-ea-gold px-6 py-2.5 text-sm font-medium text-ea-bg shadow-ea-soft transition hover:bg-ea-gold-soft disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isWeekend
                      ? "Escribe a WhatsApp para reservas de fin de semana"
                      : status === "submitting"
                      ? "Registrando tu reserva..."
                      : "Confirmar reserva"}
                  </button>
                </div>

                <p className="text-[0.65rem] text-ea-soft-muted">
                  Al enviar este formulario no se realiza ningún cobro automático. La
                  reserva queda registrada y luego Aureya se pondrá en contacto contigo
                  para confirmar tu sesión.
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
