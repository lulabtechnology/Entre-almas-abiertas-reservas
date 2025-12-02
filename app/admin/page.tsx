"use client";

import { useEffect, useMemo, useState } from "react";

type Reserva = {
  id: string;
  nombre: string;
  edad?: number | null;
  email: string;
  telefono: string;
  whatsapp?: string;
  comentario?: string;
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // "08:00"
  duracionHoras: number;
  precioTotal: number;
  estado?: string;
  createdAt?: string | null;
};

function formatDateLabel(fecha: string) {
  if (!fecha) return "";
  const [y, m, d] = fecha.split("-").map(Number);
  const date = new Date(y, m - 1, d);

  const dayNames = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado"
  ];
  const monthNames = [
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

  const dayName = dayNames[date.getDay()];
  const dayNumber = date.getDate();
  const monthName = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName} · ${dayNumber} de ${monthName} ${year}`;
}

function formatDateYYYYMMDD(d: Date): string {
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseFecha(fecha: string): Date | null {
  if (!fecha) return null;
  const [y, m, d] = fecha.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export default function AdminPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Para el selector de fecha manual
  const [filtroFecha, setFiltroFecha] = useState<string>("");

  // Cargar reservas del rango: ayer → próximos 30 días
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const ayer = new Date(hoy);
        ayer.setDate(hoy.getDate() - 1);
        const futuro = new Date(hoy);
        futuro.setDate(hoy.getDate() + 30);

        const from = formatDateYYYYMMDD(ayer);
        const to = formatDateYYYYMMDD(futuro);

        const res = await fetch(`/api/reservas?from=${from}&to=${to}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data?.message || "No se pudieron cargar las reservas."
          );
        }

        const lista: Reserva[] = data?.reservas || [];
        setReservas(lista);
      } catch (err: any) {
        console.error(err);
        setError(
          err?.message ||
            "Ocurrió un problema al intentar obtener las reservas."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Fechas base: hoy, ayer, próximos 7 días
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const yesterday = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const nextSeven = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayStr = formatDateYYYYMMDD(today);
  const yesterdayStr = formatDateYYYYMMDD(yesterday);

  const reservasHoy = useMemo(
    () =>
      reservas.filter((r) => r.fecha === todayStr).sort((a, b) =>
        (a.horaInicio || "").localeCompare(b.horaInicio || "")
      ),
    [reservas, todayStr]
  );

  const reservasAyer = useMemo(
    () =>
      reservas.filter((r) => r.fecha === yesterdayStr).sort((a, b) =>
        (a.horaInicio || "").localeCompare(b.horaInicio || "")
      ),
    [reservas, yesterdayStr]
  );

  const reservasProximas = useMemo(
    () =>
      reservas
        .filter((r) => {
          const d = parseFecha(r.fecha);
          if (!d) return false;
          d.setHours(0, 0, 0, 0);
          return d > today && d <= nextSeven;
        })
        .sort((a, b) => {
          if (a.fecha === b.fecha) {
            return (a.horaInicio || "").localeCompare(b.horaInicio || "");
          }
          return (a.fecha || "").localeCompare(b.fecha || "");
        }),
    [reservas, today, nextSeven]
  );

  const reservasFiltradasPorFecha = useMemo(() => {
    if (!filtroFecha) return [];
    return reservas
      .filter((r) => r.fecha === filtroFecha)
      .sort((a, b) =>
        (a.horaInicio || "").localeCompare(b.horaInicio || "")
      );
  }, [reservas, filtroFecha]);

  async function cancelarReserva(id: string) {
    try {
      setCancellingId(id);
      setError(null);

      const res = await fetch(`/api/reservas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "cancelada" })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.message || "No se pudo cancelar la reserva."
        );
      }

      // Actualizamos estado local
      setReservas((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, estado: "cancelada" } : r
        )
      );
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message || "Ocurrió un error al cancelar la reserva."
      );
    } finally {
      setCancellingId(null);
    }
  }

  function estadoLabelColor(estado?: string) {
    const e = (estado || "pendiente").toLowerCase();
    if (e === "cancelada") {
      return {
        label: "Cancelada",
        classes: "border-red-300 text-red-200 bg-red-900/60"
      };
    }
    if (e === "confirmada") {
      return {
        label: "Confirmada",
        classes: "border-emerald-300 text-emerald-100 bg-emerald-900/60"
      };
    }
    if (e === "realizada") {
      return {
        label: "Realizada",
        classes: "border-sky-300 text-sky-100 bg-sky-900/60"
      };
    }
    return {
      label: "Pendiente",
      classes: "border-amber-300 text-amber-100 bg-amber-900/60"
    };
  }

  function renderLista(titulo: string, items: Reserva[]) {
    return (
      <section className="section">
        <p className="section-label">{titulo}</p>

        {items.length === 0 ? (
          <div className="mini-card">
            <p className="text-muted text-sm">
              No hay reservas en esta sección.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((r) => {
              const estadoInfo = estadoLabelColor(r.estado);

              return (
                <div
                  key={r.id}
                  className="mini-card flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <p className="gold-text text-[0.95rem]">
                      {r.nombre}
                    </p>
                    <p className="text-muted text-xs">
                      {formatDateLabel(r.fecha)} · {r.horaInicio} ·{" "}
                      {r.duracionHoras} hora
                      {r.duracionHoras > 1 ? "s" : ""} ·{" "}
                      {r.precioTotal} USD
                    </p>
                    {r.edad ? (
                      <p className="text-muted text-xs">
                        Edad: {r.edad} años
                      </p>
                    ) : null}
                    <p className="text-muted text-xs">
                      Email: {r.email}
                      <br />
                      Teléfono: {r.telefono}
                      {r.whatsapp && r.whatsapp !== r.telefono && (
                        <>
                          <br />
                          WhatsApp: {r.whatsapp}
                        </>
                      )}
                    </p>
                    {r.comentario && r.comentario.trim() !== "" && (
                      <p className="text-muted text-xs mt-1">
                        <span className="highlight-yellow">
                          Nota del cliente:
                        </span>{" "}
                        {r.comentario}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-[0.7rem] border ${estadoInfo.classes}`}
                    >
                      {estadoInfo.label}
                    </span>

                    <button
                      type="button"
                      onClick={() => cancelarReserva(r.id)}
                      disabled={
                        cancellingId === r.id ||
                        (r.estado || "").toLowerCase() === "cancelada"
                      }
                      className="mt-1 px-3 py-[0.35rem] rounded-full border border-red-300 text-[0.7rem] uppercase tracking-[0.16em] text-red-100 bg-red-900/60 hover:bg-red-800/80 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {cancellingId === r.id
                        ? "Cancelando..."
                        : (r.estado || "").toLowerCase() === "cancelada"
                        ? "Ya cancelada"
                        : "Cancelar reserva"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  return (
    <div className="bg-space min-h-screen">
      <main className="w-full">
        <div className="page-shell">
          <header className="mb-6 sm:mb-8">
            <p className="text-muted text-[0.78rem] tracking-[0.28em] uppercase">
              Panel interno · Solo Aureya
            </p>
            <h1 className="section-title gold-text !mb-2">
              Agenda de reservas
            </h1>
            <p className="section-lead">
              Aquí puedes ver tus reservas de hoy, de ayer y de los
              próximos días, además de cancelar un horario para dejarlo
              libre si algo cambia en tu agenda.
            </p>
          </header>

          {/* Resumen rápido */}
          <section className="grid-two">
            <div className="mini-card">
              <p className="text-muted text-xs uppercase tracking-[0.22em] mb-1">
                Resumen rápido
              </p>
              <p className="text-sm">
                Hoy:{" "}
                <span className="highlight-yellow">
                  {reservasHoy.length} reserva
                  {reservasHoy.length === 1 ? "" : "s"}
                </span>
              </p>
              <p className="text-sm">
                Próximos 7 días:{" "}
                <span className="highlight-yellow">
                  {reservasProximas.length} reserva
                  {reservasProximas.length === 1 ? "" : "s"}
                </span>
              </p>
            </div>

            <div className="mini-card">
              <p className="text-muted text-xs uppercase tracking-[0.22em] mb-1">
                Buscar por fecha específica
              </p>
              <div className="form-field mb-0">
                <label>Filtrar por día</label>
                <input
                  type="date"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                />
              </div>
              {filtroFecha && (
                <p className="text-muted text-xs mt-1">
                  Mostrando reservas para{" "}
                  <span className="highlight-yellow">
                    {formatDateLabel(filtroFecha)}
                  </span>
                  .
                </p>
              )}
            </div>
          </section>

          {/* Mensajes de estado */}
          {loading && (
            <div className="mini-card mt-4">
              <p className="text-sm text-muted">
                Cargando reservas, un instante...
              </p>
            </div>
          )}

          {error && (
            <div
              className="mt-4"
              style={{
                borderRadius: "1rem",
                border: "1px solid rgba(248,113,113,0.7)",
                background: "rgba(127,29,29,0.85)",
                padding: "0.75rem 0.9rem",
                fontSize: "0.82rem"
              }}
            >
              {error}
            </div>
          )}

          {/* Secciones Hoy / Ayer / Próximos días */}
          {renderLista("Hoy", reservasHoy)}
          {renderLista("Ayer", reservasAyer)}
          {renderLista("Próximos días", reservasProximas)}

          {/* Resultado del filtro por fecha exacta */}
          {filtroFecha && (
            <section className="section">
              <p className="section-label">
                Reservas en la fecha seleccionada
              </p>
              {reservasFiltradasPorFecha.length === 0 ? (
                <div className="mini-card">
                  <p className="text-muted text-sm">
                    No hay reservas registradas para ese día.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reservasFiltradasPorFecha.map((r) => {
                    const estadoInfo = estadoLabelColor(r.estado);
                    return (
                      <div
                        key={r.id}
                        className="mini-card flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <p className="gold-text text-[0.95rem]">
                            {r.nombre}
                          </p>
                          <p className="text-muted text-xs">
                            {formatDateLabel(r.fecha)} · {r.horaInicio} ·{" "}
                            {r.duracionHoras} hora
                            {r.duracionHoras > 1 ? "s" : ""} ·{" "}
                            {r.precioTotal} USD
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-[0.7rem] border ${estadoInfo.classes}`}
                          >
                            {estadoInfo.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => cancelarReserva(r.id)}
                            disabled={
                              cancellingId === r.id ||
                              (r.estado || "").toLowerCase() ===
                                "cancelada"
                            }
                            className="mt-1 px-3 py-[0.35rem] rounded-full border border-red-300 text-[0.7rem] uppercase tracking-[0.16em] text-red-100 bg-red-900/60 hover:bg-red-800/80 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            {cancellingId === r.id
                              ? "Cancelando..."
                              : (r.estado || "").toLowerCase() ===
                                "cancelada"
                              ? "Ya cancelada"
                              : "Cancelar reserva"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
