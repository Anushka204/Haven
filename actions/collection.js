"use server";  // ✅ This must be at the very top

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCollection(data) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) throw new Error("User not found");

        const collection = await db.collection.create({
            data: {
                name: data.name,
                description: data.description,
                userId: user.id,
            },
        });

        revalidatePath('/dashboard');
        return collection;
    } catch (error) {
        throw new Error(error.message);
    }
}

export async function getCollections() {

        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");


        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        const collections = await db.collection.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
        });


        return collections;
    }
    export async function getCollection(collectionId) {

        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");


        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        const collections = await db.collection.findUnique({
            where:{
                userId:user.id,
                id:collectionId,
            },
        });


        return collections;
    }
    export async function deleteCollection(collectionId) {

       try{

        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");


        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        const collection = await db.collection.findFirst({
            where:{
                userId:user.id,
                id:collectionId,
            },
        });

if(!collection) throw new Error("Collection not found");
await db.collection.delete({
    where:{
        id:collectionId,
    },
});
        return true;
    }
catch(error){
throw new Error(error.message);
}
    }