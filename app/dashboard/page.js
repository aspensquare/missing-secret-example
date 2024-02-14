import { auth } from "@/auth";

export default async function Dashboard( {} ) {
    const session = await auth();
    console.log( session );

    return (
        <>
            <h2 className={"mt-6"}>Dashboard</h2>
        </>
    );
}