import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,

} = NextAuth( {
    providers: [Google, Facebook],
    callbacks: {
        async signIn( { user, account, profile, email, credentials } ) {
            console.log( { user, account, profile, email, credentials } );
            return true
        },
        async redirect( { url, baseUrl } ) {
            return baseUrl
        },
        async session( { session, user, token } ) {
            return session
        },
        async jwt( { token, user, account, profile, isNewUser } ) {
            return token
        }
    }
} );