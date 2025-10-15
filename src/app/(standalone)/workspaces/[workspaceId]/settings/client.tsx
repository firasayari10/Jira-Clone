"use client"
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { EditWorkspaceForm } from "@/features/workspaces/components/update-workspace-form"
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

 

export const WorkspaceIdSettingsClient=()=>{
      
        const workspaceId = useWorkspaceId();
        const {data , isLoading} = useGetWorkspace({workspaceId})
    
        if(isLoading)
        {
            return <PageLoader />
        }
        if(!data)
        {
            return <PageError message="Project Not found !" />
        }
    
    return(
        <div className="w-full lg:max-w-xl">
            <EditWorkspaceForm intialValues={data}/>

        </div>
    )
}