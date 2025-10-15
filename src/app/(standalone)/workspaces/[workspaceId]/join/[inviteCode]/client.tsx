"use client";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { JoinWorkspaceForm } from "@/features/workspaces/components/join-workspace-form";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

export const WorkspaceIdJoinClient =()=>{

    const workspaceId= useWorkspaceId();

    const {data:intialValues , isLoading}=useGetWorkspace({workspaceId});

    if(isLoading)
    {
        return <PageLoader />
    }

    if(!intialValues)
    {
        return <PageError  message="Workspace Info not found "/>
    }
    return (
        <div className="w-full lg:maw-w-xl">
            <JoinWorkspaceForm intialValues={intialValues}/>

        </div>
    )
}