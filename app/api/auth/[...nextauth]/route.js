import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectDB();
        const user = await User.findOne({ email: credentials.email.toLowerCase() });
        if (!user) return null;
        const isValid = await user.comparePassword(credentials.password);
        if (!isValid) return null;
        if (user.status === "Pending") throw new Error("PENDING");
        if (user.status === "Rejected") throw new Error("REJECTED");
        if (user.status === "Inactive") throw new Error("INACTIVE");
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          company: user.company,
          status: user.status,
          isSuperAdmin: user.isSuperAdmin || false,
          organizationId: user.organizationId ? user.organizationId.toString() : null,
          impersonatedBy: null,
          impersonatedByRole: null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.company = user.company;
        token.status = user.status;
        token.isSuperAdmin = user.isSuperAdmin || false;
        token.organizationId = user.organizationId || null;
        token.impersonatedBy = user.impersonatedBy || null;
        token.impersonatedByRole = user.impersonatedByRole || null;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.company = token.company;
      session.user.status = token.status;
      session.user.isSuperAdmin = token.isSuperAdmin || false;
      session.user.organizationId = token.organizationId || null;
      session.user.impersonatedBy = token.impersonatedBy || null;
      session.user.impersonatedByRole = token.impersonatedByRole || null;
      return session;
    },
  },
  pages: { signIn: "/login", error: "/login" },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
// v2
