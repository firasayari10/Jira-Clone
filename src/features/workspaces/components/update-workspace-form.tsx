"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {useRef} from "react"
import {  updateWorkspaceSchema } from "../schemas";
import z from "zod";
import { Card 
    ,CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage

}from "@/components/ui/form"

import { DottedSeperator } from "@/components/dotted-seperator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Avatar 
    ,AvatarFallback,
    
} from "@radix-ui/react-avatar";
import { ArrowLeftIcon, CopyIcon, ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Workspace } from "../types";
import { useUpdateWorkspace } from "../api/use-update-workpsace";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteWorkspace } from "../api/use-delete-workpsace";
import { toast } from "sonner";
import { useResetInviteCode } from "../api/use-reset-invite-code";


interface EditWorkspaceFormProps {
    onCancel?: ()=> void;
    intialValues: Workspace ;
};

export const EditWorkspaceForm = ({onCancel , intialValues}:EditWorkspaceFormProps) => {
    const router= useRouter();
    const {mutate , isPending} = useUpdateWorkspace();
    const inputRef = useRef<HTMLInputElement>(null);
    const [DeleteDialog,confirmDelete ]=useConfirm("Delete Workspace" , "This Action cannot be undone ","destructive");
    const {mutate:DeleteWorkspace , isPending:isDeletingWorkspace}= useDeleteWorkspace();
    const {mutate:resetInviteCode , isPending:isResettingInviteCode}= useResetInviteCode();
    const [ResetCodeDialog,confirmReset ]=useConfirm("Reset Invite Code " , "Once a new codeis Generated the current invite code will be obsolete","destructive");

    const form = useForm<z.infer<typeof updateWorkspaceSchema>>({
        resolver:zodResolver(updateWorkspaceSchema), 
        defaultValues:{
            ...intialValues,
            image:intialValues.imageUrl ?? "" ,


        }
    });
    const handleDelete =async ()=> {
        const ok = await confirmDelete();
        if(!ok) return;

        DeleteWorkspace({
            param:{workspaceId:intialValues.$id}
        },{
            onSuccess:()=>{
                window.location.href= "/"
            }
        })
    }
    const handleReset =async ()=> {
        const ok = await confirmReset();
        if(!ok) return;

        resetInviteCode({
            param:{workspaceId:intialValues.$id}
        },)
    }
    const onSubmit = ( values:z.infer<typeof updateWorkspaceSchema>) => {
        const finalValues = {
            ...values,
            image: values.image instanceof File ? values.image : "",
        }
        mutate({form:finalValues ,
            param: {workspaceId : intialValues.$id}
        } , )
    }
    const  handleImageChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
        const file = e.target.files?.[0];
        if(file)
        {
            form.setValue("image",file)
        }
    }
    const fullInviteLink =`${window.location.origin}/workspaces/${intialValues.$id}/join/${intialValues.inviteCode}`

    const handleCopyInviteLink = ()=>
    {
        navigator.clipboard.writeText(fullInviteLink)
        .then(()=>toast.success("Invited Link copied to Clipboard"))
    }

    return (<div className="flex flex-col gap-y-4">
        <DeleteDialog/>
        <ResetCodeDialog />

      
    <Card className="w-full h-full border-none shadow-none">
        <CardHeader className="flex  flex-row items-center gap-x-4 p-7 space-y-0">
            <Button size="sm" variant="secondary" onClick={onCancel ? onCancel: ()=> router.push(`/workspaces/${intialValues.$id}`)}>
                <ArrowLeftIcon  className="size-4 "/>
                Back
                
            </Button>
            <CardTitle className="text-xl font-bold">
                {intialValues.name}

            </CardTitle>
            
        </CardHeader>
        <DottedSeperator />
        <div>
            <CardContent className="p-7">

           <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-y-4 ">
                <FormField 
                control={form.control}
                name="name"
                render={({field})=> (
                    <FormItem>
                        <FormLabel>
                            Workspace Name
                        </FormLabel>
                        <FormControl>
                            <Input 
                            {...field}
                            placeholder="Enter workspace Name"/>
                        </FormControl>
                        <FormMessage />

                    </FormItem>
                )}
                />
                <FormField 
                control={form.control}
                name="image"
                render={({field})=> (
                    <div className="flex flex-col gap-y-2">
                        <div className="flex items-center gap-x-5">
                            {field.value ? (
                                <div className="size-[72px] relative rounded-md overflow-hidden">
                                    <Image
                                    alt="Logo" 
                                    fill 
                                    className="object-cover"
                                    src={
                                        field.value instanceof File ? URL.createObjectURL(field.value) : field.value
                                    }/>
                                </div>
                            ):(
                                <Avatar className="size-[72px]">
                                    <AvatarFallback>
                                            <ImageIcon className="size-[36px] text-neutral-400"/>

                                    </AvatarFallback>

                                </Avatar>
                            )}
                            <div className="flex flex-col">
                                <p className="text-sm">
                                    Workspace Icon
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    JPG,PNG,SVG or JPEG , max 1mb

                                </p>
                                <input 
                                className="hidden"
                                type="file"
                                accept=".jpg , .png , .jpeg , .svg"
                                ref={inputRef}
                                
                                onChange={handleImageChange}/>
                                {field.value ? (<Button
                                type="button"
                                disabled={isPending}
                                variant="destructive"
                                size="xs"
                                className="w-fit mt-2"
                                onClick={()=> {
                                    field.onChange(null);
                                    if(inputRef.current){
                                        inputRef.current.value=""
                                    }
                                }}
                                >
                                    Remove Image
                                </Button>):(
                                    <Button
                                type="button"
                                disabled={isPending}
                                variant="tertiary"
                                size="xs"
                                className="w-fit mt-2"
                                onClick={()=> inputRef.current?.click()}
                                >
                                    upload Image
                                </Button>

                                )}

                            </div>

                        </div>

                    </div>
                )}
                />
                </div>
                <DottedSeperator className="py-7"/>
                <div className="flex items-center justify-between">
                    <Button 
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={isPending}
                    className={cn(!onCancel && "invisible")}>
                        Cancel

                    </Button>
                    <Button 
                    disabled={isPending}
                    type="submit"
                    size="lg">
                        Save Changes

                    </Button>

                </div>


            </form>
           </Form>
            </CardContent>

        </div>

    </Card>
    <Card className="w-full h-full border-none shadow-none">
        <CardContent className="p-7" >
            <div className="flex flex-col">
                <h3 className="font-bold">
                    Invite Members

                </h3>
                <p className="text-sm text-muted-foreground">
                    Use the Invite Link to invtie memebrs to your workspace

                </p>
                <div className="mt-4">
                    <div className="flex items-center gap-x-2">
                        <Input disabled value ={fullInviteLink}/>
                        <Button
                        onClick={handleCopyInviteLink}
                        variant="secondary"
                        className="size-12" >
                            <CopyIcon className="size-5"/>

                        </Button>

                    </div>

                </div>
                <DottedSeperator className="py-7"/>
                <Button 
                className="mt-6 w-fit ml-auto"
                size="sm"
                variant="destructive"
                type="button"
                disabled={isPending || isResettingInviteCode}
                onClick={handleReset}>
                    Reset Invite Link
                </Button>

            </div>

        </CardContent>

    </Card>
    <Card className="w-full h-full border-none shadow-none">
        <CardContent className="p-7" >
            <div className="flex flex-col">
                
                <h3 className="font-bold">
                    Danger Zone

                </h3>
                <p className="text-sm text-muted-foreground">
                    Deleting a workspace is a irreversible and will remove all associated data

                </p>
                <DottedSeperator className="py-7"/>
                <Button 
                className="mt-6 w-fit ml-auto"
                size="sm"
                variant="destructive"
                type="button"
                disabled={isPending || isDeletingWorkspace}
                onClick={handleDelete}>
                    Delete workspace
                </Button>

            </div>

        </CardContent>

    </Card>
    </div>
    )
   

}