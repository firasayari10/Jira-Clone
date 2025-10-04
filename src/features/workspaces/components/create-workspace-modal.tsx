"use client"
import {ResponsiveModal} from "@/components/responsive-modal"
import {CreateWorkspaceForm} from "./create-workspace-form"
import { useCreateWorkspace } from "../api/use-create-workpsace"
import { useCreateWorkspaceModal } from "../hooks/use-create-workspace-modal"


export const CreateWorkspaceModal = ()=> {
    const {isOpen , setIsOpen , close} = useCreateWorkspaceModal()
    return (
        <ResponsiveModal open= {isOpen} onOpenChange={setIsOpen} >
            <CreateWorkspaceForm onCancel={close} />
        </ResponsiveModal>
    )

}