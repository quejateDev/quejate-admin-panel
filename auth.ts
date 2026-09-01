import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { UserRole } from "@prisma/client"
import authConfig from "@/auth.config"
import { findUserByEmailInsensitive, getUserById } from "@/data/user"
import { getAccountByUserId } from "./data/account"
import prisma from "./lib/prisma"

/**
 * Roles que pueden **obtener sesión** en el panel de administración.
 *
 * 🔴 Esta constante es el cierre de **C-01**. Hasta la Tarea 15, el panel
 * autenticaba a cualquier cuenta con el correo verificado, **sin mirar el
 * rol**: la interfaz rechazaba a un ciudadano —lo mandaba a una página que ni
 * existe— pero **la sesión sí se creaba**, y el middleware solo comprueba que
 * haya sesión, no de quién es. Con esa sesión, `PATCH /api/users/[id]` del
 * panel aceptaba un campo `password`, así que la cadena completa era:
 * registrarse en Quéjate → entrar al panel → tomar el control de cualquier
 * cuenta, incluida la de mayor privilegio.
 *
 * La cadena está rota por dos sitios desde el repunte —el backend responde 403
 * a un `CLIENT` y ya no acepta `password` en esa ruta—, pero **una sesión de
 * panel para una cuenta que no es de panel sigue siendo una sesión que no
 * debería existir**. Aquí se niega desde el principio.
 */
const PANEL_ROLES: ReadonlySet<UserRole> = new Set([
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.EMPLOYEE,
]);

export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    async linkAccount({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      });
    }
  },
  callbacks: {
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }

      if (token.isOAuth !== undefined && session.user) {
        session.user.isOAuth = token.isOAuth as boolean;
      }

      if (token.image && session.user) {
        session.user.image = token.image as string | null;
      }

      return session;
    },

    /**
     * Decide si se crea la sesión. Es el único punto por el que se entra al
     * panel, por credenciales o por Google, así que las dos vías se comprueban
     * aquí y con la misma regla.
     *
     * ⚠️ **Orden que hay que tener presente:** en Auth.js este callback corre
     * **antes** de que el adaptador cree o enlace la cuenta. En la vía de
     * Google, `user` es la fila de la base de datos solo si esa cuenta de
     * Google ya estaba enlazada; si no, es el perfil que devuelve Google, cuyo
     * `id` es el identificador de Google y no el nuestro. Por eso la cuenta se
     * resuelve **por correo** y no por `user.id`.
     *
     * Reglas, en orden:
     *
     * 1. La cuenta tiene que **existir** en Quéjate. Quien nunca ha existido no
     *    puede ser personal de una entidad, así que Google deja de poder crear
     *    cuentas nuevas desde el panel.
     * 2. Tiene que estar **activa**. Desactivar a alguien ya le corta las
     *    peticiones al backend (`EntityScopeGuard`); esto le cierra también la
     *    puerta de entrada.
     * 3. Tiene que **tener rol de panel** ({@link PANEL_ROLES}). Es C-01.
     * 4. El correo tiene que estar **verificado**, y cada vía lo comprueba
     *    donde le corresponde: por credenciales, la columna `emailVerified`;
     *    por Google, el `email_verified` del propio perfil de Google.
     *
     *    Por qué la vía de Google **no** mira la columna: `emailVerified` se
     *    escribe en el evento `linkAccount`, que ocurre *después* de este
     *    callback. Exigir la columna aquí dejaría a un funcionario que entra
     *    por Google por primera vez en un bloqueo permanente — nunca se
     *    verificaría porque nunca llegaría a enlazarse. Y no es un hueco: que
     *    Google afirme que ese correo es suyo es exactamente la garantía que la
     *    columna representa.
     */
    async signIn({ user, account, profile }) {
      const email = user.email ?? profile?.email;
      if (!email) return false;

      const existingUser = await findUserByEmailInsensitive(email);
      if (!existingUser) return false;
      if (!existingUser.isActive) return false;
      if (!PANEL_ROLES.has(existingUser.role)) return false;

      if (account?.provider === "credentials") {
        return Boolean(existingUser.emailVerified);
      }

      // Google (y cualquier OAuth futuro): la verificación la afirma el
      // proveedor. `email_verified` no está en el tipo `Profile` de Auth.js
      // porque es específico de OIDC, pero Google siempre lo envía.
      return (profile as { email_verified?: boolean } | undefined)
        ?.email_verified !== false;
    },

    async jwt({ token }) {
      if(!token.sub) return token;

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      const existingAccount = await getAccountByUserId(existingUser.id);
      
      token.isOAuth = !!existingAccount;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.role = existingUser.role;
      token.image = existingUser.image || null;
      return token
    }
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
})
