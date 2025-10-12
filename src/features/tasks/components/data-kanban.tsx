import  React,{ useCallback, useEffect,useState} from "react"
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult
} from "@hello-pangea/dnd"

import { Task , TaskStatus}from "../types" ;
import { KanbanColumnHeader } from "./kanban-column-header";
import { KanbanCard } from "./kanban-card";

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


    });

    const onDragEnd = useCallback((result: DropResult)=>{
        if(!result.destination)return;

        const {source , destination} = result;
        const sourceStatus = source.droppableId as TaskStatus ;
        const destStatus = destination.droppableId as TaskStatus;

        let updatesPayLoad: {$id: string ; status: TaskStatus, postion: number; }

        setTasks((prevTasks)=>{
            const newTasks = {...prevTasks};

            const sourceColumn = [...newTasks[sourceStatus]];
            const [movedTask] = sourceColumn.splice(source.index,1);

            if(!movedTask){
                console.error("No task found at the source index ");
            return prevTasks            
                } 

            const updatedMovedTask = sourceStatus !== destStatus
                ? {...movedTask , status:destStatus}: movedTask;

            newTasks[sourceStatus] = sourceColumn;


            const destColumn = [...newTasks[destStatus]];
            destColumn.splice(destination.index,0, updatedMovedTask );
            newTasks[destStatus] = destColumn ;


           const updatesPayLoad = [];
                    updatesPayLoad.push({
                    $id: updatedMovedTask.$id,
                    status: destStatus,
                    position: Math.min((destination.index + 1) * 1000, 1_000_000),
                    });

        newTasks[destStatus].forEach((task,index)=>{
            if(task && task.$id !== updatedMovedTask.$id)
            {
                const newPosition = Math.min((index+1)* 1000, 1_000_000);
                if(task.position !== newPosition)
                {
                    updatesPayLoad.push({
                        $id: task.$id,
                        status: destStatus,
                        position: newPosition,
                    });
                }
            }
        });

        if(sourceStatus !== destStatus){
            newTasks[sourceStatus].forEach((task,index)=>{
                if(task){
                    const newPosition = Math.min((index +1)* 1000, 1_000_000);
                    if(task.position !== newPosition){
                        updatesPayLoad.push({
                            $id:task.$id,
                            status:sourceStatus,
                            position:newPosition
                        })
                    }
                }
            })
        }
        return newTasks;

        })

    },[])

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex overflow-x-auto">
                {boards.map((board)=> {
                    return (
                        <div key={board} className="flex-1 mx-2 bg-muted p-1.5 rounded-md min-w-[200px]">
                            <KanbanColumnHeader board={board} taskCount={tasks[board].length} 
                            />
                            <Droppable  droppableId={board}>
                            {(provided)=> (
                                <div {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="min-h-[200px] py-1.5">
                                    {tasks[board].map((task,index)=>(
                                        <Draggable 
                                        key={task.$id}
                                        draggableId={task.$id}
                                        index={index}>
                                            {
                                                (provided) => (
                                                    <div
                                                    ref={provided.innerRef}
                                                    {...provided.dragHandleProps}
                                                    {...provided.draggableProps}>
                                                       <KanbanCard task={task}/>


                                                    

                                                    </div>
                                                )
                                            }

                                        </Draggable>
                                    ))}
                                    {provided.placeholder}

                                </div>
                            )}
                            </Droppable>
                            
                        </div>
                    )
                })}

            </div>

        </DragDropContext>
    )
}