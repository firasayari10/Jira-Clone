import { zValidator } from "@hono/zod-validator";
import {Hono} from "hono" ;
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schemas";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABSE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";
import { ID , Query} from "node-appwrite";
import { buffer } from "stream/consumers";
import { MemberRole } from "@/features/members/types";
import { generateInviteCode } from "@/lib/utils";
import { getMember } from "@/features/members/utils";

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

export default app ; 