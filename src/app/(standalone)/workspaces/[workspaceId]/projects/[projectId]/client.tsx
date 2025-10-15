"use client"

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { EditProjectForm } from "@/features/projects/components/update-project-form"
import { useProjectId } from "@/features/projects/hooks/use-project-id"


export const ProjectIdSettingsClient =()=>{
    const projectId=useProjectId();
    const {data:intialValues , isLoading}= useGetProject({projectId}) 

    if(isLoading)
    {
        return <PageLoader />
    }
    if(!intialValues)
    {
        return <PageError message="Project Not found" />
    }
    return (
        <div className="w-full lg:max-w-xl">
            <EditProjectForm intialValues={intialValues} />

        </div>
    )
}