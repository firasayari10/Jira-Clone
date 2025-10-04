import { zValidator } from "@hono/zod-validator";
import {Hono} from "hono" ;
import { createWorkspaceSchema } from "../schemas";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABSE_ID, IMAGES_BUCKET_ID, WORKSPACES_ID } from "@/config";
import { ID } from "node-appwrite";
import { buffer } from "stream/consumers";

const app = new Hono()
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
            },
        );
        return c.json({data: workspace})

    }

)

export default app ; 