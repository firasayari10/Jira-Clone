import { DATABSE_ID, MEMBERS_ID, PROJECTS_ID, WORKSPACES_ID } from "@/config";
import { createSessionClient } from "@/lib/appwrite";
import { getMember } from "../members/utils";
import { Query } from "node-appwrite";
import {Project} from "./types"
import ErrorPage from "@/app/error"

interface GetProjectProps {
    projectId:string
}
export const getProject = async ({projectId}:GetProjectProps) => {
    
    
    const { databases , account} = await createSessionClient() ;
    const user= await account.get();

     const project = await databases.getDocument<Project>(
            DATABSE_ID,
            PROJECTS_ID,
            projectId,
            
        );
    const member = await getMember({
        databases,
        userId:user.$id,
        workspaceId:project.workspaceId

    });
    if(!member )
            throw new Error ("Unauthorized")
    
    return project;
    

}