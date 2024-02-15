import { auth, signIn, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function SignIn( { searchParams } ) {
    const session = await auth();
    const user = session?.user?.email;

    return (
        <>
            <section>
                <div>
                    {
                        !user && <SignInForm callbackUrl={searchParams.callbackUrl || "/"}/>
                    }
                </div>
            </section>
        </>
    )
}

function SignInForm( { callbackUrl } ) {

    return (
        <>
            <p>You are not logged in</p>

            <form
                className={"my-2"}
                action={async () => {
                    "use server";
                    await signIn( "google", {
                        redirect: true,
                        redirectTo: callbackUrl,
                        callbackUrl
                    } );
                }}
            >
                <Button type="submit">Sign in with Google</Button>
            </form>

            <form
                className={"my-2"}
                action={async () => {
                    "use server";
                    await signIn( "facebook", {
                        // redirect: true,
                        // redirectTo: callbackUrl,
                        callbackUrl
                    } );
                }}
            >
                <Button type="submit">Sign in with Facebook</Button>
            </form>

            <form
                className={"my-2"}
                action={async () => {
                    "use server";
                    await signIn( "aspen-identity", {
                        // redirect: true,
                        // redirectTo: callbackUrl,
                        username: "chris_primavera@aspensquare.com",
                        password: "Prim6006#"
                    } );
                }}
            >
                <Button type="submit">Sign in with Aspen</Button>
            </form>
        </>
    );
}