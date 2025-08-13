import NextAuth from 'next-auth'
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { Adapter } from 'next-auth/adapters'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user) {
            return null
          }

          // Pour les utilisateurs OAuth, pas de mot de passe
          if (!user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string
      }

      // Récupérer les infos utilisateur complètes
      if (session.user.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              plan: true,
              role: true,
              stripeCustomerId: true,
            }
          })
          
          if (dbUser) {
            session.user = {
              ...session.user,
              id: dbUser.id,
              plan: dbUser.plan,
              role: dbUser.role,
              stripeCustomerId: dbUser.stripeCustomerId,
            }
          }
        } catch (error) {
          console.error('Session callback error:', error)
        }
      }

      return session
    },
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === 'google' || account?.provider === 'github') {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (!existingUser) {
            // Créer l'utilisateur s'il n'existe pas
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                emailVerified: new Date(),
              }
            })
          }
        }
        return true
      } catch (error) {
        console.error('SignIn callback error:', error)
        return false
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }