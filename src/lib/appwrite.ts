// src/lib/server/appwrite.ts
"use server";

import "server-only";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "../features/auth/constants";
import { Client, Account, Users, Databases } from "node-appwrite";

export async function createSessionClient(): Promise<{
  account: Account;
  databases: Databases;
}> {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

  const session = cookies().get(AUTH_COOKIE);

  if (!session?.value) {
    throw new Error("Unauthorized");
  }

  client.setSession(session.value);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
  };
}

export async function createAdminClient(): Promise<{
  account: Account;
  users: Users;
}> {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
    .setKey(process.env.NEXT_APPWRITE_KEY!);

  return {
    get account() {
      return new Account(client);
    },
    get users() {
      return new Users(client);
    },
  };
}
