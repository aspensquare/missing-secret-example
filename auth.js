import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import * as jose from "jose"

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth( {
    providers: [Google, Facebook, CredentialsProvider( {
        id: "aspen-identity",
        // The name to display on the sign in form (e.g. "Sign in with...")
        name: "Aspen Identity",
        // `credentials` is used to generate a form on the sign in page.
        // You can specify which fields should be submitted, by adding keys to the `credentials` object.
        // e.g. domain, username, password, 2FA token, etc.
        // You can pass any HTML attribute to the <input> tag through the object.
        credentials: {
            username: { label: "Username", type: "text" },
            password: { label: "Password", type: "password" }
        },
        async authorize( credentials, req ) {
            // Add logic here to look up the user from the credentials supplied
            const myHeaders = new Headers();
            myHeaders.append( "Content-Type", "application/x-www-form-urlencoded" );
            myHeaders.append( "Accept", "application/json" );

            const urlencoded = new URLSearchParams();
            urlencoded.append( "grant_type", "password" );
            urlencoded.append( "username", credentials.username );
            urlencoded.append( "password", credentials.password );

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: urlencoded,
            };

            try {
                const response = await fetch( "http://localhost:8000/api/token", requestOptions );
                const user = await response.json();
                const aspenUser = jose.decodeJwt( user.access_token );
                // Any object returned will be saved in `user` property of the JWT
                return {
                    ...aspenUser,
                    name: aspenUser.unique_name,
                    email: aspenUser.unique_name,
                    accessToken: user.access_token
                };
            } catch ( e ) {
                // If you return null then an error will be displayed advising the user to check their details.
                return null;
                // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
            }
        }
    } )],
    callbacks: {
        async signIn( { user, account, profile, email, credentials } ) {
            console.log( "verify with asp.net identity" );
            //profile.sub === AspNetUserLogins.ProviderKey (google)
            //profile.id === AspNetUserLogins.ProviderKey (facebook)
            return true
        },
        async redirect( { url, baseUrl } ) {
            const redirectUrl = ( new URL( url ) ).searchParams.get( "callbackUrl" );

            if ( redirectUrl ) return redirectUrl;

            return baseUrl
        },
        async session( { session, user, token } ) {
            if ( token?.accessToken ) {
                session.accessToken = token.accessToken;
            }
            return session
        },
        async jwt( { token, user, account, profile, isNewUser } ) {
            if ( account?.provider === "aspen-identity" ) {
                token.accessToken = user.accessToken;
                token.roles = [user.role];
            }
            return token
        },
        async authorized( { request, auth } ) {
            //TODO: check auth?.accessToken expiration
            return auth?.user;
        }
    },
    pages: {
        signIn: "/auth/signin",
    },
} );