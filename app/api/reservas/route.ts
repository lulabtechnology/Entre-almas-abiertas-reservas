import { NextResponse } from "next/server";
import { getDb } from "../../../lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

const HOURLY_RATE = 60;

type ReservaBody = {
  nombre: string;
  edad?: number | string | null;
  email: string;
  telefono: string;
  whatsapp?: string | null;
  comentario?: string;
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // "08:00"
  duracionHoras: number;
};

// POST /api/reservas  -> crear reserva
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ReservaBody;

    const {
      nombre,
      edad,
      email,
      telefono,
      whatsapp,
      comentario,
      fecha,
      horaInicio,
      duracionHoras
    } = body;

    if (!nombre || !email || !telefono || !fecha || !horaInicio || !duracionHoras) {
      return NextResponse.json(
        { message: "Faltan campos obligatorios en la reserva." },
        { status: 400 }
      );
    }

    // Verificación extra de fin de semana, por seguridad
    const [year, month, day] = fecha.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    const dayOfWeek = d.getDay(); // 0 domingo, 6 sábado

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return NextResponse.json(
        {
          message:
            "Las reservas de sábado y domingo se gestionan por WhatsApp. Por favor escribe a +507 6215-9551."
        },
        { status: 400 }
      );
    }

    const db = getDb();

    // Evitar doble reserva en misma fecha + hora (ignorando las canceladas)
    const snap = await db
      .collection("reservas")
      .where("fecha", "==", fecha)
      .where("horaInicio", "==", horaInicio)
      .get();

    const yaOcupada = snap.docs.some((doc) => {
      const data = doc.data() as any;
      return data.estado !== "cancelada";
    });

    if (yaOcupada) {
      return NextResponse.json(
        {
          message:
            "Ya existe una reserva activa para ese día y esa hora. Elige otro horario, por favor."
        },
        { status: 409 }
      );
    }

    const duracion = Number(duracionHoras) || 1;
    const edadNumber =
      typeof edad === "number" ? edad : edad ? Number(edad) || null : null;
    const precioTotal = HOURLY_RATE * duracion;
    const whatsappFinal = whatsapp && whatsapp.trim() !== "" ? whatsapp : telefono;

    const docRef = await db.collection("reservas").add({
      nombre,
      edad: edadNumber,
      email,
      telefono,
      whatsapp: whatsappFinal,
      comentario: comentario || "",
      fecha, // YYYY-MM-DD
      horaInicio, // "08:00"
      duracionHoras: duracion,
      precioTotal,
      estado: "pendiente", // luego podremos cambiar a confirmada, realizada, cancelada
      createdAt: FieldValue.serverTimestamp()
    });

    return NextResponse.json(
      {
        id: docRef.id,
        message: "Reserva creada correctamente."
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error al crear reserva:", error);
    return NextResponse.json(
      {
        message:
          "No pudimos registrar tu reserva en este momento. Intenta de nuevo en unos minutos."
      },
      { status: 500 }
    );
  }
}

// GET /api/reservas?from=YYYY-MM-DD&to=YYYY-MM-DD  -> listar por rango
export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);

    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let query: FirebaseFirestore.Query = db.collection("reservas");

    if (from && to) {
      query = query
        .where("fecha", ">=", from)
        .where("fecha", "<=", to)
        .orderBy("fecha", "asc");
    } else if (from) {
      query = query.where("fecha", ">=", from).orderBy("fecha", "asc");
    } else {
      // Si no mandas rango, simplemente ordena por fecha asc
      query = query.orderBy("fecha", "asc");
    }

    const snap = await query.get();

    const reservas = snap.docs.map((doc) => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt
          ? data.createdAt.toDate().toISOString()
          : null
      };
    });

    // Por si queremos asegurar que dentro de cada día se ordene por hora
    reservas.sort((a, b) => {
      if (a.fecha === b.fecha) {
        return (a.horaInicio || "").localeCompare(b.horaInicio || "");
      }
      return (a.fecha || "").localeCompare(b.fecha || "");
    });

    return NextResponse.json({ reservas }, { status: 200 });
  } catch (error: any) {
    console.error("Error al listar reservas:", error);
    return NextResponse.json(
      { message: "No se pudieron obtener las reservas." },
      { status: 500 }
    );
  }
}
