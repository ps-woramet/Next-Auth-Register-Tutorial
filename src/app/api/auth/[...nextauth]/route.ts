import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials";
import { Account, User as AuthUser } from "next-auth";
import User from '@/models/User'
import connect from "@/utlis/db";
import bcrypt from 'bcryptjs'

export const authOptions:any = {
    
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID??"",
      clientSecret: process.env.GITHUB_SECRET??"",
    }),

    CredentialsProvider({
        // The name to display on the sign in form (e.g. "Sign in with...")
        name: "Credentials",
        id: "creadentials",
        credentials: {
          email: { label: "Email", type: "text", placeholder: "jsmith" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials:any, req) {
          await connect();
          try{
            const user = await User.findOne({email: credentials.email})
            if(user){
                const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)
                if(isPasswordCorrect){
                    return user;
                }
                else{
                    console.log('login error');
                    
                    return 
                }
            }

          }catch(err:any){
            console.log('login fail');
            
            throw new Error(err)
          }
        }
      })
    
  ],
  callback: {
    async signIn({user, account}: {user: AuthUser, account: Account}){
      if(account?.provider == "credentials"){
        return true
      }
      if(account?.provider == "github"){
        await connect()
        try{
          const existingUser = await User.findOne({email: user.email});
          if(!existingUser){
            const newUser = new User({
              email: user.email
            })

            await newUser.save()
            return true
          }
          return true
        }catch(err){
          console.log("error saving user", err);
          return false
          
        }
      }
    }
  }
}

export const handler = NextAuth(authOptions)
export {handler as GET, handler as POST}