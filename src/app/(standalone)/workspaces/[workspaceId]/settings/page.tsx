import { redirect} from "next/navigation"
import {getCurrent} from "@/features/auth/actions";
import { EditWorkspaceForm } from "@/features/workspaces/components/update-workspace-form";
import { getWorkspace } from "@/features/workspaces/actions";


interface  WorkspaceIdSettingsPageProps {
    params:{
        workspaceId: string;
    }
}
const WorkspaceIdSettingsPage = async ({
    params,
}:WorkspaceIdSettingsPageProps) => {

    const user = await getCurrent();
    if(!user) redirect("/sign-in");
    const intialValues =await getWorkspace( {workspaceId : params.workspaceId})
    if (!intialValues)
        redirect (`/workspaces/${params.workspaceId}`)
    return (
        <div className="w-full lg:max-w-xl">
            <EditWorkspaceForm  intialValues={intialValues}/>
        </div>
    )
}


export default WorkspaceIdSettingsPage ;