
"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Client, Account } from "node-appwrite";
import { OAuthProvider } from "node-appwrite";

export async function signUpWithGithub() {
	const client = new Client()
		.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
		.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

	const account = new Account(client);

	const headersList = await headers();
	const origin = headersList.get("origin");

	const redirectUrl = await account.createOAuth2Token(
		OAuthProvider.Github,
		`${origin}/oauth`,
		`${origin}/sign-up`
	);

	return redirect(redirectUrl);
}

export async function signUpWithGoogle() {
	const client = new Client()
		.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
		.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

	const account = new Account(client);

	const headersList = await headers();
	const origin = headersList.get("origin");

	const redirectUrl = await account.createOAuth2Token(
		OAuthProvider.Google,
		`${origin}/oauth`,
		`${origin}/sign-up`
	);

	return redirect(redirectUrl);
}