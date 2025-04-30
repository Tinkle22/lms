import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            school: true
          }
        });

        if (!user) {
          console.log("User not found:", credentials.email);
          return null;
        }

        try {
          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!passwordMatch) {
            console.log("Password doesn't match for:", credentials.email);
            return null;
          }

          console.log("Login successful for:", user.email, "with role:", user.role);
          
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            schoolId: user.schoolId
          };
        } catch (error) {
          console.error("Error comparing passwords:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.schoolId = user.schoolId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.schoolId = token.schoolId;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };