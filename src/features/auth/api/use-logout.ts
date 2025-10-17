import { useMutation, useQueryClient } from "@tanstack/react-query";
import {  InferResponseType } from "hono";
import {toast} from "sonner";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";

type ResponseType = InferResponseType<typeof client.api.auth.logout["$post"]>;
//type RequestType = InferRequestType<typeof client.api.auth.logout["$post"]>;

export const useLogOut = () => {
  const router= useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,  
    Error 
        
  >({
    mutationFn: async () => {
      const response = await client.api.auth.logout["$post"]();
       if(!response.ok)
      {
        throw new Error ("Failed to log Out ")
      }
      return await response.json() ;
    },
    onSuccess:() => {
      toast.success("Logged Out Successfully")
      router.refresh()
      queryClient.invalidateQueries()
    },
    onError:()=>{
      toast.error("Loging Out Failed !");
    }
  });

  return mutation;
};
