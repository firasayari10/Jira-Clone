"use client"

import { DottedSeperator } from "@/components/dotted-seperator";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { useGetTask } from "@/features/tasks/api/use-get-task";
import { DataKanban } from "@/features/tasks/components/data-kanban";
import { TaskBreadcrumbs } from "@/features/tasks/components/task-bread-crumbs";
import { TaskDescription } from "@/features/tasks/components/task-description";
import { TaskOverview } from "@/features/tasks/components/tasks-overview";
import { useTaskId } from "@/features/tasks/hooks/use-task-id"


export const TaskIdClient = ()=>{

    const taskId = useTaskId();

    const  {data , isLoading} = useGetTask({taskId});

    if(isLoading){
        return <PageLoader />
    }
    if(!data)
    {
        return <PageError message="Task Not found " />
     }

    return (
        <div className="flex flex-col">
            <TaskBreadcrumbs project={data.project} task={data} />
            <DottedSeperator className="my-6"/>
            <div className="grid grio-cols-1 lg:grid-cols-2 gap-4">
                <TaskOverview  task={data}/>
                <TaskDescription task={data}/>


            </div>
            
        </div>
    )
}