import  React,{ useCallback, useEffect,useState} from "react"
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult
} from "@hello-pangea/dnd"

import { Task , TaskStatus}from "../types" ;
import { KanbanColumnHeader } from "./kanban-column-header";

const boards:TaskStatus[] = [
    TaskStatus.BACKLOG,
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.IN_REVIEW,
    TaskStatus.DONE
];

type TaskState = {
    [key in TaskStatus]:Task[]
}

interface DataKanbanProps{
    data: Task[]
}

export const DataKanban = ({ data}:DataKanbanProps)=>{

    const  [tasks,setTasks] = useState<TaskState> (()=>{
        const intialTasks:TaskState = {
            [TaskStatus.BACKLOG]:[],
            [TaskStatus.TODO]:[],
            [TaskStatus.IN_PROGRESS]:[],
            [TaskStatus.IN_REVIEW]:[],
            [TaskStatus.DONE]:[],

        };

        data.forEach((task)=>{
            intialTasks[task.status].push(task)       
        
        
        });

        Object.keys(intialTasks).forEach((status)=>{
            intialTasks[status as TaskStatus].sort((a,b)=> a.position - b.position)
        })

        return intialTasks;


    })
    return (
        <DragDropContext onDragEnd={()=>{}}>
            <div className="flex overflow-x-auto">
                {boards.map((board)=> {
                    return (
                        <div key={board} className="flex-1 mx-2 bg-muted p-1.5 rounded-md min-w-[200px]">
                            <KanbanColumnHeader board={board} taskCount={tasks[board].length} 
                            />
                            
                        </div>
                    )
                })}

            </div>

        </DragDropContext>
    )
}