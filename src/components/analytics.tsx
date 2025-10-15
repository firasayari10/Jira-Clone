import { ProjectAnalyticsResponseType } from "@/features/projects/api/use-get-project-analytics";
import { ScrollArea , ScrollBar} from "./ui/scroll-area";
import { AnalyticsCard } from "./analytics-card";
import { DottedSeperator } from "./dotted-seperator";


export const Analytics = ({data}:ProjectAnalyticsResponseType)=>{
    
    return (
        <ScrollArea className="border rounded-lg w-full whitespace-nowrap shrink-0">
            <div className="w-full flex flex-row">
                <div className="flex items-center flex-1">
                    <AnalyticsCard 
                    title="Total Tasks"
                    value={data.taskCount}
                    variant={data.taskDifference > 0 ? "up" : "down"}
                    increaseValue={data.taskDifference}/>

                </div>
                <DottedSeperator direction="vertical"/>
                <div className="flex items-center flex-1">
                    <AnalyticsCard 
                    title="Assigned Tasks"
                    value={data.assignedTaskCount}
                    variant={data.assignedTaskDifference > 0 ? "up" : "down"}
                    increaseValue={data.assignedTaskDifference}/>

                </div>
                <DottedSeperator direction="vertical"/>
                <div className="flex items-center flex-1">
                    <AnalyticsCard 
                    title="Completed Tasks"
                    value={data.CompleteTaskCount}
                    variant={data.CompleteTaskDifference > 0 ? "up" : "down"}
                    increaseValue={data.CompleteTaskDifference}/>

                </div>
                <DottedSeperator direction="vertical" />
                <div className="flex items-center flex-1">
                    <AnalyticsCard 
                    title="Overdue Tasks"
                    value={data.OverDueTaskCount}
                    variant={data.OverDueTaskDifference > 0 ? "up" : "down"}
                    increaseValue={data.OverDueTaskDifference}/>

                </div>
                <DottedSeperator direction="vertical" />
                <div className="flex items-center flex-1">
                    <AnalyticsCard 
                    title="Incomplete Tasks"
                    value={data.incompleteTaskCount}
                    variant={data.incompleteTaskDifference > 0 ? "up" : "down"}
                    increaseValue={data.incompleteTaskDifference}/>

                </div>
                <DottedSeperator direction="vertical" />
                

            </div>
            <ScrollBar orientation="horizontal"/>

        </ScrollArea>
    )
}

