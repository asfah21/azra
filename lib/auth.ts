// lib/auth.ts
// import { PrismaClient, Role } from "@prisma/client"; // You no longer need PrismaClient here
import { Role } from "@prisma/client"; // Only import Role if you're using it (which you are)
import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import prisma from "@/lib/prisma"; // <--- IMPORT THE GLOBAL PRISMA CLIENT HERE

declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    photo?: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      role: Role;
      photo?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    photo?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter email and password");
        }

        try {
          // Test database connection first
          await prisma.$connect();
          
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.password) {
            throw new Error("No user found with this email");
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          if (!isValid) {
            throw new Error("Invalid password");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            photo: user.photo,
          };
        } catch (error) {
          console.error("Auth error:", error);
          
          // Check if it's a database connection error
          if (error instanceof Error) {
            if (error.message.includes("connect") || error.message.includes("connection")) {
              throw new Error("Database connection error. Please check your database configuration.");
            }
            if (error.message.includes("timeout")) {
              throw new Error("Database connection timeout. Please try again.");
            }
          }
          
          throw new Error("Authentication failed. Please try again.");
        } finally {
          // Always disconnect after auth attempt
          await prisma.$disconnect();
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.photo = user.photo;

        // Update lastActive saat login
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { lastActive: new Date() },
          });
        } catch (error) {
          console.error("Error updating lastActive:", error);
          // Don't fail the login if this fails
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          email: token.email!,
          name: token.name ?? null,
          role: token.role,
          photo: token.photo ?? null,
        };
      }

      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 3 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
};
