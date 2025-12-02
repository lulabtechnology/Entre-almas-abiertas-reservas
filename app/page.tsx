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
      // Aquí luego conectaremos con Firestore y /api/reservas.
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStatus("success");
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
                {/* Primera fila: nombre y edad */}
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
                  <div className="form-field">
                    <label>Fecha de la sesión *</label>
                    <input
                      type="date"
                      value={fecha}
                      onChange={(e) => handleFechaChange(e.target.value)}
                      required
                    />
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
                      <option value={1}>1 hora
