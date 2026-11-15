import { cache } from "react";
import { getServerSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "staf@forcoffe.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan kata sandi wajib diisi");
        }

        const normalizedEmail = credentials.email.toLowerCase().trim();

        // Cari user berdasarkan email
        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user || !user.password) {
          throw new Error("Email atau kata sandi tidak valid");
        }

        // Verifikasi kecocokan kata sandi dengan hash bcrypt
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Email atau kata sandi tidak valid");
        }

        // Return user object yang akan disimpan di token JWT
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
        session.user.role = token.role;
        if (token.name) session.user.name = token.name;
        if (token.email) session.user.email = token.email;

        // Ambil data profil terbaru langsung dari Prisma agar setiap perubahan nama/role
        // langsung tampil secara real-time di seluruh dashboard tanpa perlu logout & login ulang
        try {
          const freshUser = await prisma.user.findUnique({
            where: { id: token.id },
            select: { name: true, role: true, email: true },
          });

          if (freshUser) {
            session.user.name = freshUser.name;
            session.user.role = freshUser.role;
            session.user.email = freshUser.email;
          }
        } catch (err) {
          console.error("Gagal sinkronisasi data sesi pengguna dari database:", err);
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Deduplicated session fetcher cached per React server render request cycle.
 * Prevents redundant session decoding/verification when layout and page both call it.
 */
export const getAuthSession = cache(async () => {
  return await getServerSession(authOptions);
});


