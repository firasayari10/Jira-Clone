"use client";
import { DottedSeperator } from "@/components/dotted-seperator";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle

}from "@/components/ui/card"
import Link from "next/link";
import { useJoinWorkspace } from "../api/use-join-workspace";
import { useInviteCode } from "../hooks/use-invite-code";
import { useWorkspaceId } from "../hooks/use-workspace-id";
import { useRouter } from "next/navigation";

interface JoinWorkspaceFormProps{
    intialValues:{
        name:string;
    },
}
export const JoinWorkspaceForm =({
intialValues
}:JoinWorkspaceFormProps) => {
    const router = useRouter()
    const workspaceId = useWorkspaceId()
    const inviteCode = useInviteCode()
    const {mutate , isPending} = useJoinWorkspace()

    const onSubmit =()=> {
        mutate({
            param:{workspaceId} ,
            json:{code:inviteCode}
        },{
            onSuccess:({data}) => {
                router.push(`/workspaces/${data.$id}`)

            }
        })

    }
    return(
        <Card className="w-full h-full border-none shadow-none">
        <CardHeader className="p-7">
            <CardTitle className="text-xl font-bold">
                Join Workspace

            </CardTitle>
            <CardDescription>
                you&apos;ve been invited to <strong>{intialValues.name}</strong> worksapce 
            </CardDescription>

        </CardHeader>
        <div className="p-7">
            <DottedSeperator />
        </div>
        <CardContent className="p-7" >
            <div className="flex flex-col lg:flex-row gap-2 items-center justify-start">
                <Button className="w-full lg:w-fit" 
                variant="secondary"
                type="button"
                asChild
                size="lg" 
                disabled={isPending}>
                    <Link href="/">
                    Cancecl
                    </Link> 
                </Button>
                <Button className="w-full lg:w-fit"
                size="lg"
                type="button"
                onClick={onSubmit}
                disabled={isPending}
                >
                    Join Workspace
                </Button>

            </div>


        </CardContent>

    </Card>
    )
    
}