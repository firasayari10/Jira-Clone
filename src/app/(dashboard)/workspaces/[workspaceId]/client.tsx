"use client"
import {CalendarIcon , PlusIcon , SettingsIcon} from"lucide-react";
import {formatDistanceToNow}from "date-fns";
import Link from "next/link";
import { Analytics } from "@/components/analytics";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import {Card , CardContent} from "@/components/ui/card"
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-getprojects";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { useCreateTaskModal } from "@/features/tasks/hooks/use-create-task-modal";
import { Task } from "@/features/tasks/types";
import { useGetWorkspaceAnalytics } from "@/features/workspaces/api/use-get-workspace-analytics";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id"
import { DottedSeperator } from "@/components/dotted-seperator";


export const WorkspaceIdClient =()=>{
    const workspaceId = useWorkspaceId();

    const {data:analytics, isLoading:isLoadingAnalytics}= useGetWorkspaceAnalytics({workspaceId});
    const {data:tasks, isLoading:isloadingTasks}= useGetTasks({workspaceId});
    const {data:projects, isLoading:isloadingProjects}= useGetProjects({workspaceId});
    const {data:members, isLoading:isloadingMembers}= useGetMembers({workspaceId});


    const {open:createProject} = useCreateProjectModal();
    

    const isLoading =  isLoadingAnalytics || isloadingMembers || isloadingProjects || isloadingTasks ;

    if(isLoading){
        return <PageLoader />
    }

    if(!analytics || !tasks || !projects || !members)
    {
        return <PageError message="Failed to load workspace Data" />
    }
  return (
    <div className="h-full flex flex-col space-y-4">
        <Analytics  data={analytics}/>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <TaskList data={tasks.documents} total={tasks.total} />

        </div>

    </div>
  )
}


interface TaskListProps {
    data: Task[];
    total:number;
}

export const TaskList = ({data, total}:TaskListProps)=>{
    const workspaceId = useWorkspaceId();
    const {open: createTask}=useCreateTaskModal();
    return (
        <div  className="flex flex-col gap-y-4 col-span-1">
           <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">
                    Tasks ( {total})
                </p>
                <Button variant="muted" size="icon" onClick={createTask}>
                    <PlusIcon  className="size-4 text-neutral-400"/>

                </Button>

            </div>
            <DottedSeperator className="my-4"/>
                <ul className="flex flex-col gap-y-4">
                    {data.map((task)=>(
                        <li key={task.$id}>
                            <Link href={`/workspaces/${workspaceId}/tasks/${task.$id}`}>
                            <Card className="shadow-none rounded-lg hover:opacity-75 transition">
                                <CardContent className="p-4">
                                    <p className="text-lg font-medium truncate">
                                        {task.name}

                                    </p>
                                    <div className="flex items-center gap-x-2">
                                        <p >
                                            {task.project?.name}
                                        </p>
                                        <div className="size-1 rounded-full bg-neutral-300"/>
                                        <div className="text-sm text-muted-foreground flex items-center">
                                            <CalendarIcon className="size-4 mr-1"/>
                                            <span className="truncate">
                                                {formatDistanceToNow(new Date(task.dueDate))}

                                            </span>

                                        </div>

                                    </div>
                                </CardContent>

                            </Card>
                            </Link>
                        </li>
                    ))}
                    <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
                        No tasks found

                    </li>

                </ul>
                <Button variant="muted" className="mt-4 w-full">
                    <Link href={}>
                    Show All   
                    </Link>
                    

                </Button>


           </div>

        </div>
    )

}