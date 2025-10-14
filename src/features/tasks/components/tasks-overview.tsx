import { Button } from "@/components/ui/button"
import { Task } from "../types"
import { PencilIcon } from "lucide-react"
import { DottedSeperator } from "@/components/dotted-seperator"
import { OverviewProrety } from "./overview-proprety"
import { MemberAvatar } from "@/features/members/components/member-avatar"
import { TaskDate } from "./taskdate"
import { Badge } from "@/components/ui/badge"
import { snakeCaseToTitleCase } from "@/lib/utils"
import { useEditTaskModal } from "../hooks/use-edit-task-modal"


interface TaskOverviewProps {
    task:Task
}
export const  TaskOverview = ({
    task
}:TaskOverviewProps

)=> {
    const { open} = useEditTaskModal()
    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between gap-x-4">
                    <p className="text-lg font-semibold ">
                    Overview

                </p>
                <Button onClick={()=>open(task.$id)} className="sm" variant="secondary">
                    <PencilIcon  className="size-4 mr-2"/>
                    Edit
                </Button>
                <DottedSeperator className="my-4"/>
                <div className="flex flex-col gap-y-4">
                    <OverviewProrety label="Assignee">
                        <MemberAvatar 
                        name={task.assignee.name}
                        className="size-6"/>
                        <p className="text-sm font-medium">
                            {task.assignee.name}
                        </p>

                    </OverviewProrety>
                    <OverviewProrety label="Due Date" >
                        <TaskDate  value={task.dueDate} className="text-sm font-medium"/>

                    </OverviewProrety>
                    <OverviewProrety label="Status">
                        <Badge variant={task.status}>
                            {snakeCaseToTitleCase(task.status)}

                        </Badge>

                    </OverviewProrety>

                </div>
                </div>

            </div>


        </div>

    )
}