import { Query , type Databases} from "node-appwrite";

import{ DATABSE_ID , MEMBERS_ID} from "@/config" ;


interface GetMemberProps {
    databases: Databases;
    workspaceId: string;
    userId:string;
}


export const getMember = async({
databases,
workspaceId,
userId
}:GetMemberProps)=> {
    const members = await databases.listDocuments(
        DATABSE_ID,
        MEMBERS_ID,
        [Query.equal("workspaceId",workspaceId),
            Query.equal("userId",userId)

        ]
    );
    return members.documents[0];

}