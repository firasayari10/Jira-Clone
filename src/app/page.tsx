"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogOut } from "@/features/auth/api/use-logout";
import { useCurrent } from "@/features/auth/api/usecurrent";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function Home() {
    const router = useRouter();
    const { data , isLoading} = useCurrent();
    const { mutate } = useLogOut();

    useEffect(()=> {
        if(!data && !isLoading)
        {
            router.push("/sign-in");
        }
    },[data]);

  return (
    <div>
        Only visible to authrozied Users
        <Button onClick={()=> mutate()}>
            LogOut
        </Button>
  
    </div>
  );
}
