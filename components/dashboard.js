"use client";
import { useSession } from "next-auth";

export default function Dashboard() {
    const { data: session } = useSession();

    if ( !session ) return null;

    return (
        <>
            {`Welcome ${session?.user?.name}`}
        </>
    );
}