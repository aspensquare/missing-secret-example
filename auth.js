import NextAuth from "next-auth";
import AppleProvider from "next-auth/providers/apple"
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import * as jose from "jose"

const registerOAuth = async ( { email, provider, providerKey } ) => {
    const myHeaders = new Headers();
    myHeaders.append( "Authorization", `Bearer ${process.env.IDENTITY_SERVICE_TOKEN}` );
    myHeaders.append( "Content-Type", "application/json" );

    const raw = JSON.stringify( {
        "email": email,
        "provider": provider,
        "providerKey": providerKey
    } );

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
    };

    try {
        const response = await fetch( "https://dev-identity-api.aspensquare.com/api/Account/RegisterOAuth", requestOptions );
        return await response.json();
    } catch ( e ) {
        const x = "tst";
        //what happens if we can't verify user and obtain token?
    }
};
const initializeToken = async ( token, user, account, profile ) => {
    if ( account?.provider === "aspen-identity" ) {
        token.accessToken = user?.accessToken;
        token.roles = [user?.role];
    }

    if ( account?.provider === "google" ) {
        const aspenToken = await registerOAuth( {
            email: user.email,
            provider: account.provider,
            providerKey: profile.sub
        } );
        const aspenUser = jose.decodeJwt( aspenToken );

        token.accessToken = aspenToken;
        token.roles = [aspenUser.role];
    }

    if ( account?.provider === "facebook" ) {
        const aspenToken = await registerOAuth( {
            email: user.email,
            provider: account.provider,
            providerKey: profile.id
        } );
        const aspenUser = jose.decodeJwt( aspenToken );

        token.accessToken = aspenToken;
        token.roles = [aspenUser.role];
    }

    return token;
};

export const config = {
    trustHost: true,
    basePath: "/api/auth",
    debug: true,
    //https://github.com/nextauthjs/next-auth/issues/6788#issuecomment-1658765772
    cookies: {
        pkceCodeVerifier: {
            name: "next-auth.pkce.code_verifier",
            options: {
                httpOnly: true,
                sameSite: "none",
                path: "/",
                secure: true,
            },
        },
    },
    secret: process.env.AUTH_SECRET,
    providers: [
        AppleProvider( {
            //https://github.com/nextauthjs/next-auth/issues/6788#issuecomment-1658765772
            clientId: process.env.AUTH_APPLE_ID,
            clientSecret: process.env.AUTH_APPLE_SECRET,
            wellKnown: "https://appleid.apple.com/.well-known/openid-configuration",
            checks: ["pkce"],
            token: {
                url: `https://appleid.apple.com/auth/token`,
            },
            authorization: {
                url: "https://appleid.apple.com/auth/authorize",
                params: {
                    scope: "",
                    response_type: "code",
                    response_mode: "query",
                    state: process.env.AUTH_SECRET
                },
            },
            client: {
                token_endpoint_auth_method: "client_secret_post",
            },
        } ),
        Google,
        Facebook,
        AzureADProvider( {
            clientId: process.env.AZURE_AD_CLIENT_ID,
            clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
            tenantId: process.env.AZURE_AD_TENANT_ID,
        } ),
        CredentialsProvider( {
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
                    const response = await fetch( "https://dev-identity-api.aspensquare.com/api/token", requestOptions );
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
        } )
    ],
    callbacks: {
        //     // async signIn( { user, account, profile, email, credentials } ) {
        //     //     return true
        //     // },
        //
        //     // async redirect( { url, baseUrl } ) {
        //     //     const redirectUrl = ( new URL( url ) ).searchParams.get( "callbackUrl" );
        //     //
        //     //     if ( redirectUrl ) return redirectUrl;
        //     //
        //     //     return baseUrl
        //     // },
        //
        //     async session( { session, user, token } ) {
        //         console.log( user );
        //         if ( token?.accessToken ) {
        //             session.accessToken = token.accessToken;
        //         }
        //         return session
        //     },
        //
        //     async jwt( { token, user, account, profile, isNewUser } ) {
        //         console.log( account );
        //         if ( account ) {
        //             return await initializeToken( token, user, account, profile );
        //         }
        //
        //         return token;
        //     },
        //
        async authorized( { request, auth } ) {
            if ( !auth?.user ) return false;
            return auth?.user;
        }
    },
    pages: {
        signIn: "/auth/signin",
    },
};

export const { handlers, auth, signIn, signOut } = NextAuth( config );