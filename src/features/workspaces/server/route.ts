import { zValidator } from "@hono/zod-validator";
import {Hono} from "hono" ;
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schemas";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABSE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, TASKS_ID, WORKSPACES_ID } from "@/config";
import { ID , Query} from "node-appwrite";

import { MemberRole } from "@/features/members/types";
import { generateInviteCode } from "@/lib/utils";
import { getMember } from "@/features/members/utils";
import z from "zod";
import { Workspace } from "../types";

import { endOfMonth , startOfMonth , subMonths} from "date-fns";

import { TaskStatus } from "@/features/tasks/types";

const app = new Hono()
.get("/", sessionMiddleware,
    async(c)=> {
        const user=c.get("user");
        const databases = c.get("databases");
        const members = await databases.listDocuments(
            DATABSE_ID,
            MEMBERS_ID,
            [Query.equal("userId",user.$id)]
        );
        if(members.total === 0) {
            return c.json({data: {documents: [], total: 0}})
        }

        const workspaceIds = members.documents.map((member)=>member.workspaceId)


        const workspaces = await databases.listDocuments(
            DATABSE_ID,
            WORKSPACES_ID,
            [   Query.orderDesc("$createdAt"),
                Query .contains("$id",workspaceIds)]
        );

        return c.json({ data:workspaces})
    }
)
.post(
    "/",
    zValidator("form", createWorkspaceSchema),sessionMiddleware,
    async(c)=> {
        const databases = c.get("databases");
        const storage = c.get("storage");
        const user = c.get("user");
       
        const {name , image} = c.req.valid("form")
        let uploadedImageUrl : string |undefined;
         if( image instanceof File) 
        {
            const file = await storage.createFile(
                IMAGES_BUCKET_ID,
                ID.unique(),
                image,
            );

        const arraybuffer = await storage.getFileView(
            IMAGES_BUCKET_ID,
            file.$id,
        );
        uploadedImageUrl=`data:image/png;base64,${Buffer.from(arraybuffer).toString("base64")}`
        }
        const workspace = await databases.createDocument(
            DATABSE_ID,
            WORKSPACES_ID,
            ID.unique(),
            {
                name,
                userId: user.$id,
                imageUrl: uploadedImageUrl,
                inviteCode: generateInviteCode(6),
            },
        );

        await databases.createDocument(
            DATABSE_ID,
            MEMBERS_ID,
            ID.unique(),
            {
                userId: user.$id,
                workspaceId: workspace.$id,
                role: MemberRole.ADMIN,
            }
        )
        return c.json({data: workspace})

    }

)
.patch(
    "/:workspaceId",
    sessionMiddleware,
    zValidator("form",updateWorkspaceSchema),
    async(c)=>{
        const databases = c.get("databases");
        const storage = c.get("storage");
        const user=c.get("user");

        const {workspaceId} = c.req.param();
        const {name , image} = c.req.valid("form")

        const member= await  getMember({
            databases,
            workspaceId,
            userId:user.$id
        });
        if(!member || member.role !== MemberRole.ADMIN)
            return c.json({error: "unauthorized"},401)

        let uploadedImageUrl : string |undefined;
         if( image instanceof File) 
        {
            const file = await storage.createFile(
                IMAGES_BUCKET_ID,
                ID.unique(),
                image,
            );

        const arraybuffer = await storage.getFileView(
            IMAGES_BUCKET_ID,
            file.$id,
        );
        uploadedImageUrl=`data:image/png;base64,${Buffer.from(arraybuffer).toString("base64")}`
        } else {
                uploadedImageUrl=image
        }

        const workspace = await databases.updateDocument(
            DATABSE_ID,
            WORKSPACES_ID,
            workspaceId,
            {
                name,
                imageUrl:uploadedImageUrl
            }
        )
        return c.json({data:workspace})
    }

)
.delete(
    "/:workspaceId",
    sessionMiddleware,
    async(c) => {
        const databases = c.get("databases");
        const user = c.get("user");
        const { workspaceId} = c.req.param();

        const member =await getMember({
            databases,
            workspaceId,
            userId: user.$id
        });

        if (!member || member.role !== MemberRole.ADMIN)
        {
            return c.json({error: "unauthorized"}, 401);
        }

        await databases.deleteDocument(
            DATABSE_ID,
            WORKSPACES_ID,
            workspaceId
        );

        return c.json({data : { $id: workspaceId}});
    }
)
.post(
    "/:workspaceId/reset-invite-code",
    sessionMiddleware,
    async(c) => {
        const databases = c.get("databases");
        const user = c.get("user");
        const { workspaceId} = c.req.param();

        const member =await getMember({
            databases,
            workspaceId,
            userId: user.$id
        });

        if (!member || member.role !== MemberRole.ADMIN)
        {
            return c.json({error: "unauthorized"}, 401);
        }

        const workspace=await databases.updateDocument(
            DATABSE_ID,
            WORKSPACES_ID,
            workspaceId,
            {
                inviteCode:generateInviteCode(6)
            }
        );

        return c.json({data : workspace});
    }
)
.post("/:workspaceId/join"
    ,sessionMiddleware,
    zValidator("json", z.object({code : z.string()})),
    async (c)=> {
        const { workspaceId} = c.req.param();
        const  {code}= c.req.valid("json");

        const databases=c.get("databases");
        const user=c.get("user");

        const member = await getMember({
            databases,
            workspaceId,
            userId:user.$id
        });
        if(member)
        {
            return c.json({error: "Already a member"},400);
        }
        

        const workspace = await databases.getDocument<Workspace>(
            DATABSE_ID,
            WORKSPACES_ID,
            workspaceId
        );
        if(workspace.inviteCode !== code)
        {
            return c.json({error : "Invalid invite code"},400)
        }

        await databases.createDocument(
            DATABSE_ID,
            MEMBERS_ID,
            ID.unique(),
            {
                workspaceId,
                userId:user.$id,
                role:MemberRole.MEMBER,
            }
        );
        return c.json({data:workspace})

        

    }
)
.get(
    "/:workspaceId",
    sessionMiddleware,
    async(c)=>{
        const user = c.get("user");
        const databases = c.get("databases")
        const {workspaceId} = c.req.param();

        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id
        });

        if(!member)
        {
            return c.json({error:"Unauthorized"},401)
        }
        const workspace = await databases.getDocument<Workspace>(
            DATABSE_ID,
            WORKSPACES_ID,
            workspaceId
        )

        return c.json({data:workspace})

    }
)
.get(
    "/:workspaceId/info",
    sessionMiddleware,
    async(c)=>{
        
        const databases = c.get("databases")
        const {workspaceId} = c.req.param();

        
        
        const workspace = await databases.getDocument<Workspace>(
            DATABSE_ID,
            WORKSPACES_ID,
            workspaceId
        )

        return c.json({data: {$id:workspace.$id , name: workspace.name , imageUrl:workspace.imageUrl} })

    }
)
.get(
    "/:workspaceId/analytics" ,
    sessionMiddleware,
    async(c)=>{
        const databases=c.get("databases");
        const user=c.get("user");
        const {workspaceId} = c.req.param();

        
        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id
        })

        if(!member)
        {
            return c.json({error:"Unauthorized"},401)
        }

        const now = new Date();
        const thisMonthStart = startOfMonth(now);
        const thisMonthEnd = endOfMonth(now);
        const lastMonthStart = startOfMonth(subMonths(now,1));
        const lastMonthEnd = endOfMonth(subMonths(now,1));


        const thisMonthTasks = await databases.listDocuments(
            DATABSE_ID,
            TASKS_ID,
            [
                Query.equal("workspaceId",workspaceId),
                Query.greaterThanEqual("$createdAt",thisMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt",thisMonthEnd.toISOString())
            ]
        );

        const lastMonthTasks = await databases.listDocuments(
            DATABSE_ID,
            TASKS_ID,
            [
                Query.equal("workspaceId",workspaceId),
                Query.greaterThanEqual("$createdAt",lastMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt",lastMonthEnd.toISOString())
            ]
        );

        const taskCount = thisMonthTasks.total;

        const taskDifference = taskCount - lastMonthTasks.total;


        const thisMonthAssignedTasks = await databases.listDocuments(
            DATABSE_ID,
            TASKS_ID,
            [
                Query.equal("workspaceId",workspaceId),
                Query.equal("assigneeId",member.$id),
                Query.greaterThanEqual("$createdAt",thisMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt",thisMonthEnd.toISOString())
            ]
        );

        const lastMonthAssignedTasks = await databases.listDocuments(
            DATABSE_ID,
            TASKS_ID,
            [
                Query.equal("workspaceId",workspaceId),
                Query.equal("assigneeId",member.$id),
                Query.greaterThanEqual("$createdAt",lastMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt",lastMonthEnd.toISOString())
            ]
        );

        const assignedTaskCount = thisMonthAssignedTasks.total;
        const assignedTaskDifference = assignedTaskCount - lastMonthAssignedTasks.total;


         const thisMonthIncompleteTasks = await databases.listDocuments(
            DATABSE_ID,
            TASKS_ID,
            [
                Query.equal("workspaceId",workspaceId),
                Query.notEqual("status",TaskStatus.DONE),
                
                Query.greaterThanEqual("$createdAt",thisMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt",thisMonthEnd.toISOString())
            ]
        );

        const lastMonthIncompleteTasks = await databases.listDocuments(
            DATABSE_ID,
            TASKS_ID,
            [
                Query.equal("workspaceId",workspaceId),
                Query.notEqual("status",TaskStatus.DONE),
                Query.greaterThanEqual("$createdAt",lastMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt",lastMonthEnd.toISOString())
            ]
        );

        const incompleteTaskCount = thisMonthIncompleteTasks.total;

        const incompleteTaskDifference = incompleteTaskCount - lastMonthIncompleteTasks.total ;

        const thisMonthCompletedTasks = await databases.listDocuments(
            DATABSE_ID,
            TASKS_ID,
            [
                Query.equal("workspaceId",workspaceId),
                Query.equal("status",TaskStatus.DONE),
                
                Query.greaterThanEqual("$createdAt",thisMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt",thisMonthEnd.toISOString())
            ]
        );

        const lastMonthCompletedTasks = await databases.listDocuments(
            DATABSE_ID,
            TASKS_ID,
            [
                Query.equal("workspaceId",workspaceId),
                Query.equal("status",TaskStatus.DONE),
                Query.greaterThanEqual("$createdAt",lastMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt",lastMonthEnd.toISOString())
            ]
        );

        const CompleteTaskCount = thisMonthCompletedTasks.total;

        const CompleteTaskDifference = CompleteTaskCount - lastMonthCompletedTasks.total ;



          const thisMonthOverDueTasks = await databases.listDocuments(
            DATABSE_ID,
            TASKS_ID,
            [
                Query.equal("workspaceId",workspaceId),
                Query.notEqual("status",TaskStatus.DONE),
                Query.lessThan("dueDate",now.toISOString()),
                
                Query.greaterThanEqual("$createdAt",thisMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt",thisMonthEnd.toISOString())
            ]
        );

        const lastMonthOverDueTasks = await databases.listDocuments(
            DATABSE_ID,
            TASKS_ID,
            [
                Query.equal("workspaceId",workspaceId),
                Query.notEqual("status",TaskStatus.DONE),
                Query.lessThan("dueDate",now.toISOString()),
                Query.greaterThanEqual("$createdAt",lastMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt",lastMonthEnd.toISOString())
            ]
        );

        const OverDueTaskCount = thisMonthOverDueTasks.total;

        const OverDueTaskDifference = OverDueTaskCount - lastMonthOverDueTasks.total ;



        return c.json({
            data:{
                taskCount,
                taskDifference,
                assignedTaskCount,
                assignedTaskDifference,
                CompleteTaskCount,
                CompleteTaskDifference,
                incompleteTaskCount,
                incompleteTaskDifference,
                OverDueTaskCount,
                OverDueTaskDifference,
                
            }
        })





    }


)

export default app ; 