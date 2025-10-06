"use client"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import { useWorkspaceId } from "../hooks/use-workspace-id"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeftIcon, MoreVerticalIcon } from "lucide-react"
import { useGetMembers } from "@/features/members/api/use-get-members"
import { DottedSeperator } from "@/components/dotted-seperator"
import { Fragment } from "react"
import { MemberAvatar } from "@/features/members/components/member-avatar"
import { Separator } from "@radix-ui/react-dropdown-menu"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
}
from "@/components/ui/dropdown-menu"
import { useDeleteMember } from "@/features/members/api/use-delete-member"
import { useUpdateMember } from "@/features/members/api/use-update-member"
import { MemberRole } from "@/features/members/types"
import { useConfirm } from "@/hooks/use-confirm"
export const MemberList =()=> {
    const workspaceId = useWorkspaceId();
    const { mutate:deleteMember, isPending: isDeletingMember}=useDeleteMember();
    const { mutate:updateMember, isPending: isUpdatingMember}=useUpdateMember();
    const {data}=useGetMembers({workspaceId});
    const[ConfirmDialog , confirm] = useConfirm("Are you sure you want to delete this member ?","This action can only be undone by inviting the ddeleted member back","destructive")
    const handleUpdateMember = (memberId:string, role:MemberRole)=> {
        updateMember({
            json:{role},
            param:{memberId},
        });
    }
    const handleDeleteMember = async(memberId:string)=> {
        const ok = await confirm();
        if(!ok)return;

        deleteMember({param:{memberId}},{
            onSuccess:()=> {
                window.location.reload();
            }
        })

        
    }
    return (
        <Card className="w-full h-full border-none shadow-none">
            <ConfirmDialog />
            <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0" >
                <Button asChild variant="secondary" size="sm">
                    <Link href={`/workspaces/${workspaceId}`}>
                    <ArrowLeftIcon  className="size-4 mr-2"/>
                    Back
                    </Link>

                </Button>
                <CardTitle className="text-xl font-bold">
                        Members List    

                </CardTitle>
            </CardHeader>
            <div className="px-7">
                <DottedSeperator />

            </div>
           <CardContent className="p-7 flex flex-col gap-y-2">
                {data?.documents.map((member, index) => (
                    <Fragment key={member.$id}>
                    <div className="flex items-center gap-2">
                        <MemberAvatar
                        className="size-10"
                        fallbackClassName="text-lg"
                        name={member.name}
                        />
                        <div className="flex flex-col">
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="ml-auto" variant="secondary" size="icon">
                                <   MoreVerticalIcon className="size-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="bottom" align="end">
                                <DropdownMenuItem className="font-medium" onClick={()=>handleUpdateMember(member.$id,MemberRole.ADMIN)} disabled={isUpdatingMember}>
                                    Set as Adminstrator

                                </DropdownMenuItem>
                                <DropdownMenuItem className="font-medium" onClick={()=>handleUpdateMember(member.$id,MemberRole.MEMBER)} disabled={isUpdatingMember}>
                                    Set as Member

                                </DropdownMenuItem>
                                <DropdownMenuItem className="font-medium text-amber-700" onClick={()=>handleDeleteMember(member.$id)} disabled={isDeletingMember}>
                                    Remove  {member.name}

                                </DropdownMenuItem>



                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {index < data.documents.length - 1 && (
                        <Separator className="my-2 bg-neutral-400 h-[1px] w-full" />
                    )}
                    </Fragment>
                ))}
            </CardContent>

                
        </Card>
    )
    
}