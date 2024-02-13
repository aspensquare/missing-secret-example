"use server"

// import { signIn } from '@/auth'

export async function authenticate( action, formData ) {
    try {
        console.log( formData.get( "email" ) );
        console.log( formData.get( "password" ) );
        // await signIn( "credentials", formData )
    } catch ( error ) {
        if ( error ) {
            switch ( error.type ) {
                case "CredentialsSignin":
                    return "Invalid credentials."
                default:
                    return "Something went wrong."
            }
        }
        throw error
    }
}