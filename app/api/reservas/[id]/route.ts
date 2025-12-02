import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/firebaseAdmin";

type RouteParams = {
  params: {
    id: string;
  };
};

/**
 * PATCH /api/reservas/:id
 * Permite actualizar el estado de una reserva (por ejemplo "cancelada").
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: "ID de reserva no proporcionado." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({} as any));
    const nuevoEstado: string = body?.estado || "cancelada";

    const db = getDb();
    const docRef = db.collection("reservas").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { message: "Reserva no encontrada." },
        { status: 404 }
      );
    }

    await docRef.update({
      estado: nuevoEstado
    });

    return NextResponse.json(
      {
        id,
        estado: nuevoEstado,
        message: "Reserva actualizada correctamente."
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al actualizar reserva:", error);
    return NextResponse.json(
      { message: "No se pudo actualizar la reserva." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reservas/:id
 * Elimina por completo una reserva (si quisieras usar borrado físico).
 * De momento el panel usará PATCH (estado = "cancelada"), pero dejamos
 * esto listo por si lo quieres más adelante.
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: "ID de reserva no proporcionado." },
        { status: 400 }
      );
    }

    const db = getDb();
    const docRef = db.collection("reservas").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { message: "Reserva no encontrada." },
        { status: 404 }
      );
    }

    await docRef.delete();

    return NextResponse.json(
      { id, message: "Reserva eliminada correctamente." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al eliminar reserva:", error);
    return NextResponse.json(
      { message: "No se pudo eliminar la reserva." },
      { status: 500 }
    );
  }
}
