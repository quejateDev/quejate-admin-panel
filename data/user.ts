import prisma from "@/lib/prisma";

export const getUserByEmail = async (email: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        return user;
    } catch (error) {
        return null;
    }   
}

export const getUserById = async (id: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
        });
        return user;
    } catch (error) {
        return null;
    }   
}

/**
 * Busca la cuenta por correo tolerando diferencias de mayúsculas.
 *
 * 🔴 **Por qué existe.** La canonización del correo (Tarea 23) todavía **no se
 * ha aplicado a producción**: hay cuentas reales cuyo correo está guardado en
 * mayúsculas. `findUnique` compara byte a byte, así que si Google devuelve el
 * correo en minúsculas —que es lo que hace— la búsqueda exacta **no encuentra a
 * esa persona** y el panel le negaría el acceso.
 *
 * El orden importa: primero la búsqueda **exacta**, que es determinista, y solo
 * si no hay nada se cae a la insensible. Así, mientras existan dos filas que
 * solo se diferencien en mayúsculas —que es justo lo que la canonización viene
 * a eliminar—, quien escribe su correo tal como está guardado sigue entrando en
 * su propia cuenta y no en la otra.
 *
 * No escribe nada: **no canoniza**. Canonizar los correos de producción es un
 * paso del despliegue, con autorización explícita, no un efecto secundario de
 * iniciar sesión.
 */
export const findUserByEmailInsensitive = async (email: string) => {
    try {
        const exact = await prisma.user.findUnique({ where: { email } });
        if (exact) return exact;

        return await prisma.user.findFirst({
            where: { email: { equals: email, mode: "insensitive" } },
        });
    } catch {
        return null;
    }
}
