"use client "
import {FcGoogle} from "react-icons/fc"
import {FaGithub} from "react-icons/fa"
import { DottedSeperator } from "@/components/dotted-seperator"
import { Button } from "@/components/ui/button"
import {
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Card

} from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage
}from "@/components/ui/form"
import {useForm} from "react-hook-form" ;
import {z} from "zod";
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRegister } from "../api/use-register"
import { registerSchema } from "../schemas"





export const SignUpCard = () => {
    const {mutate , isPending} = useRegister();
    const form = useForm<z.infer<typeof registerSchema>>({
        
            resolver:zodResolver(registerSchema),
            defaultValues:{
                name:"",
                email:"",
                password:"",
            },
        });
        const onSubmit =(values: z.infer<typeof registerSchema >)=> {
            mutate({json : values})
        }
    return(
    <Card className="w-full h-full md:w-[487px] border-none shadow-none">
        <CardHeader className="flex items-center justify-center text-center p-7" >
            <CardTitle className="text-2xl">
                Sign Up!
            </CardTitle>
            <CardDescription >
                By signing up , you agree to our {" "} 
                <Link href={`/privacy`}>
                    <span className="text-blue-700">
                        Privacy Policy
                    </span>
                </Link>{" "}
                and {" "}
                <Link href={`/terms`}>
                    <span className="text-blue-700">
                        Terms of Service 
                    </span>
                </Link>

            </CardDescription>
        </CardHeader>
        <div className="px-7">
            <DottedSeperator
             />

        </div>
        <CardContent className="p-7" >
            <Form {...form}>
                
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} >
                <FormField 
                name="name"
                control={form.control}
                render={({ field})=> (
                    <FormItem>
                        <FormControl>
                        <Input
                            {...field}
                            type="text"
                            placeholder="Enter your name" 
                            />
                            </FormControl>
                            <FormMessage />
                               
                </FormItem>

                )} />
                <FormField 
                name="email"
                control={form.control}
                render={({ field})=> (
                    <FormItem>
                        <FormControl>
                        <Input
                            {...field}
                            type="email"
                            placeholder="Enter email address" 
                            />
                            </FormControl>
                            <FormMessage />
                               
                </FormItem>

                )} />
                
                <FormField 
                name="password"
                control={form.control}
                render={({ field})=> (
                    <FormItem>
                        <FormControl>
                        <Input
                            {...field}
                            type="password"
                            placeholder="Enter your password" 
                            />
                            </FormControl>
                            <FormMessage />
                               
                </FormItem>

                )} />
                <Button disabled={isPending} size="lg" className="w-full">
                    Register
                </Button>
            </form>
            </Form>
        </CardContent>
        <div className="px-7">
            <DottedSeperator />
        </div>
        <CardContent className="px-7 flex flex-col gap-y-4">
            <Button 
            disabled={isPending}
            variant="secondary"
            size="lg"
            className="w-full">
                <FcGoogle className="mr-2 size-5"/>
                Continue with Google 

            </Button>
            <Button 
            disabled={isPending}
            variant="secondary"
            size="lg"
            className="w-full">
                <FaGithub  className="mr-2 size-5" />
                Continue with Github
            </Button>

        </CardContent>
        <div className="px-7">
            <DottedSeperator />
        </div>
        <CardContent className="p-7 flex items-center justify-center">
            <p>
                Alrady have an Account ?  
                <Link href="/sign-in">
                <span className="text-blue-700" >
                    &nbsp;Sign In

                </span>
                </Link>

            </p>
        </CardContent>

    </Card>
        
    )
}