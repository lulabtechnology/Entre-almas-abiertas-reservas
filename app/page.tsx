"use client";

import { useState, FormEvent, useMemo } from "react";

const HOURLY_RATE = 60;
const HOURS = Array.from({ length: 12 }, (_, i) => 8 + i); // 8 → 19

const DAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado"
];

const MONTH_NAMES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre"
];

type DateOption = {
  value: string; // YYYY-MM-DD
  label: string; // Ej: "Lunes · 2 de diciembre 2025"
};

function getNextDateOptions(count: number): DateOption[] {
  const base = new Date();
  base.setHours(0, 0, 0, 0);

  const options: DateOption[] = [];

  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);

    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");

    const value = `${year}-${month}-${day}`;

    const label = `${DAY_NAMES[d.getDay()]} · ${d.getDate()} de ${
      MONTH_NAMES[d.getMonth()]
    } ${year}`;

    options.push({ value, label });
  }

  return options;
}

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

  const dateOptions = useMemo(() => getNextDateOptions(30), []);

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
      const whatsappFinal = whatsapp && whatsapp.trim() !== "" ? whatsapp : telefono;

      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          edad,
          email,
          telefono,
          whatsapp: whatsappFinal,
          comentario,
          fecha,
          horaInicio,
          duracionHoras
        })
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // nada
      }

      if (res.status === 409) {
        setStatus("error");
        setErrorMessage(
          data?.message ||
            "Ya existe una reserva activa para ese día y esa hora. Elige otro horario."
        );
        return;
      }

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(
          data?.message ||
            "No pudimos registrar tu reserva en este momento. Intenta de nuevo en unos minutos."
        );
        return;
      }

      // Éxito
      setStatus("success");
      setErrorMessage(null);

      setEdad("");
      setTelefono("");
      setWhatsapp("");
      setComentario("");
      setFecha("");
      setHoraInicio("");
      setDuracionHoras(1);
      setIsWeekend(false);
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage(
        "Ocurrió un error inesperado al intentar registrar tu reserva. Intenta de nuevo."
      );
    }
  }

  return (
    <div className="bg-space min-h-screen flex items-center">
      <main className="w-full">
        <div className="page-shell">
          <div className="max-w-3xl mx-auto">
            {/* Encabezado */}
            <header className="text-center mb-6 sm:mb-8">
              <p className="text-muted text-[0.78rem] tracking-[0.28em] uppercase">
                Entre Almas · Acompañamiento humano
              </p>
              <h1 className="section-title gold-text !mb-2">
                Reserva tu sesión con Aureya
              </h1>
              <p className="section-lead">
                Elige el día, la hora y cuántas horas deseas. Cada sesión tiene una
                duración de 1 hora y una inversión de{" "}
                <span className="highlight-yellow">60 USD por hora</span>.
              </p>
            </header>

            {/* Card con formulario */}
            <section className="card-soft">
              <form onSubmit={handleSubmit}>
                {/* Nombre y edad */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-field">
                    <label>Nombre completo *</label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Cómo te gustaría que te nombre"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>Edad *</label>
                    <input
                      type="number"
                      min={12}
                      max={120}
                      value={edad}
                      onChange={(e) => setEdad(e.target.value)}
                      placeholder="Tu edad"
                      required
                    />
                  </div>
                </div>

                {/* Email y teléfono */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-field">
                    <label>Correo electrónico *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Para enviarte la información de la sesión"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>Número de teléfono *</label>
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="Teléfono de contacto"
                      required
                    />
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="form-field">
                  <label>WhatsApp (si es distinto al teléfono)</label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="Si usas otro número para WhatsApp, escríbelo aquí"
                  />
                  <p className="form-hint">
                    Si lo dejas vacío, se tomará tu teléfono principal para contactarte.
                  </p>
                </div>

                {/* Qué quiere trabajar */}
                <div className="form-field">
                  <label>¿Qué te gustaría trabajar en la sesión? (opcional)</label>
                  <textarea
                    rows={3}
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Puedes compartir brevemente qué estás viviendo, qué te trae a este espacio o qué necesitas ahora."
                  />
                </div>

                {/* Fecha / hora / duración */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Fecha con menú desplegable */}
                  <div className="form-field">
                    <label>Fecha de la sesión *</label>
                    <select
                      value={fecha}
                      onChange={(e) => handleFechaChange(e.target.value)}
                      required
                    >
                      <option value="">Selecciona un día</option>
                      {dateOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Hora de inicio *</label>
                    <select
                      value={horaInicio}
                      onChange={(e) => setHoraInicio(e.target.value)}
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

                  <div className="form-field">
                    <label>Duración (horas seguidas) *</label>
                    <select
                      value={duracionHoras}
                      onChange={(e) => setDuracionHoras(Number(e.target.value))}
                      disabled={isWeekend}
                    >
                      <option value={1}>1 hora</option>
                      <option value={2}>2 horas</option>
                      <option value={3}>3 horas</option>
                    </select>
                  </div>
                </div>

                {/* Mensaje fin de semana */}
                {isWeekend && (
                  <div
                    style={{
                      borderRadius: "1rem",
                      border: "1px solid rgba(246,228,167,0.7)",
                      background: "rgba(5,13,52,0.92)",
                      padding: "0.9rem",
                      fontSize: "0.86rem",
                      marginBottom: "0.9rem",
                      marginTop: "0.3rem"
                    }}
                  >
                    <p className="highlight-yellow" style={{ marginBottom: "0.35rem" }}>
                      Fines de semana (sábado y domingo)
                    </p>
                    <p className="text-muted">
                      Las reservas de fin de semana se coordinan directamente por
                      WhatsApp. Por favor, escribe a{" "}
                      <span className="gold-text" style={{ fontSize: "0.9rem" }}>
                        +507 6215-9551
                      </span>{" "}
                      para acordar tu horario.
                    </p>
                  </div>
                )}

                {/* Resumen precio */}
                <div
                  style={{
                    borderRadius: "1.2rem",
                    border: "1px solid rgba(195,206,234,0.55)",
                    background: "rgba(5,13,52,0.88)",
                    padding: "0.9rem",
                    fontSize: "0.86rem",
                    marginTop: "0.4rem",
                    marginBottom: "0.9rem",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                    flexWrap: "wrap"
                  }}
                >
                  <div>
                    <p className="text-muted" style={{ fontSize: "0.78rem" }}>
                      Resumen
                    </p>
                    <p>
                      {duracionHoras} hora{duracionHoras > 1 ? "s" : ""} ·{" "}
                      <span className="highlight-yellow">
                        {HOURLY_RATE} USD / hora
                      </span>
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p className="text-muted" style={{ fontSize: "0.78rem" }}>
                      Total estimado
                    </p>
                    <p style={{ fontSize: "1.15rem" }} className="highlight-yellow">
                      {total} USD
                    </p>
                  </div>
                </div>

                {/* Mensajes error / éxito */}
                {errorMessage && (
                  <div
                    style={{
                      borderRadius: "1rem",
                      border: "1px solid rgba(248,113,113,0.7)",
                      background: "rgba(127,29,29,0.85)",
                      padding: "0.75rem 0.9rem",
                      fontSize: "0.82rem",
                      marginBottom: "0.7rem"
                    }}
                  >
                    {errorMessage}
                  </div>
                )}

                {status === "success" && !errorMessage && (
                  <div
                    style={{
                      borderRadius: "1rem",
                      border: "1px solid rgba(52,211,153,0.7)",
                      background: "rgba(6,78,59,0.85)",
                      padding: "0.75rem 0.9rem",
                      fontSize: "0.82rem",
                      marginBottom: "0.7rem"
                    }}
                  >
                    Gracias por tu reserva. La misma Aureya te contactará pronto para
                    confirmar tu sesión y coordinar los detalles.
                  </div>
                )}

                {/* Botón */}
                <button
                  type="submit"
                  disabled={status === "submitting" || isWeekend}
                  className="btn-gradient w-full mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isWeekend
                    ? "Escribe a WhatsApp para reservas de fin de semana"
                    : status === "submitting"
                    ? "Registrando tu reserva..."
                    : "Confirmar reserva"}
                </button>

                <p className="form-hint" style={{ marginTop: "0.6rem" }}>
                  Al enviar este formulario no se realiza ningún cobro automático. La
                  reserva queda registrada y luego Aureya se pondrá en contacto contigo
                  para confirmar tu sesión.
                </p>
              </form>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
