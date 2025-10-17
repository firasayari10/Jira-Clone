
"use client"

import { useCurrent } from "@/features/auth/api/usecurrent";
import { SignUpCard } from "@/features/auth/components/sign-up-card ";
import { redirect } from "next/navigation";

const SignUpPage =()=> {
    const user = useCurrent();
    if(!user) redirect("/")
    return (
    <SignUpCard />)
}

export default SignUpPage ;