"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {useRef} from "react"
import {  UpdateProjectSchema } from "../schemas";
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
import { ArrowLeftIcon, ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Project } from "../types";

import { useConfirm } from "@/hooks/use-confirm";


import { useUpdateProject } from "../api/use-update-project";
import { useDeleteProject } from "../api/use-delete-project";


interface EditProjectFormProps {
    onCancel?: ()=> void;
    intialValues: Project ;
};

export const EditProjectForm = ({onCancel , intialValues}:EditProjectFormProps) => {
    const router= useRouter();
    const {mutate , isPending} = useUpdateProject();
    const inputRef = useRef<HTMLInputElement>(null);
    const {
        mutate:deleteProject,
        isPending:isDeletingProjectPending
    }= useDeleteProject();
    const [DeleteDialog,confirmDelete ]=useConfirm("Delete Project" , "This Action cannot be undone ","destructive");
    
    

    const form = useForm<z.infer<typeof UpdateProjectSchema>>({
        resolver:zodResolver(UpdateProjectSchema), 
        defaultValues:{
            ...intialValues,
            image:intialValues.imageUrl ?? "" ,


        }
    });
    const handleDelete =async ()=> {
        const ok = await confirmDelete();
        if(!ok) return;

        deleteProject({
            param:{projectId:intialValues.$id}
        },{
            onSuccess:()=>{
                window.location.href= `/workspaces/${intialValues.workspaceId}`
            }
        })
    }
    
    const onSubmit = ( values:z.infer<typeof UpdateProjectSchema>) => {
        const finalValues = {
            ...values,
            image: values.image instanceof File ? values.image : "",
        }
        mutate({form:finalValues ,
            param: {projectId : intialValues.$id}
        } )
    }
    const  handleImageChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
        const file = e.target.files?.[0];
        if(file)
        {
            form.setValue("image",file)
        }
    }


   

    return (<div className="flex flex-col gap-y-4">
        <DeleteDialog/>


      
    <Card className="w-full h-full border-none shadow-none">
        <CardHeader className="flex  flex-row items-center gap-x-4 p-7 space-y-0">
            <Button size="sm" variant="secondary" onClick={onCancel ? onCancel: ()=> router.push(`/workspaces/${intialValues.workspaceId}/projects/${intialValues.$id}`)}>
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
                            Project Name
                        </FormLabel>
                        <FormControl>
                            <Input 
                            {...field}
                            placeholder="Enter Proejct Name"/>
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
                                    Project Icon
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
                    Danger Zone

                </h3>
                <p className="text-sm text-muted-foreground">
                    Deleting a Project is a irreversible and will remove all associated data

                </p>
                <DottedSeperator className="py-7"/>
                <Button 
                className="mt-6 w-fit ml-auto"
                size="sm"
                variant="destructive"
                type="button"
                disabled={isDeletingProjectPending }
                onClick={handleDelete}>
                    Delete Project
                </Button>

            </div>

        </CardContent>

    </Card>
    </div>
    )
   

}