import { NextResponse } from "next/server";
import { db } from "@/app/db";
import { User } from "@/app/db/schema";

export async function GET() {
  const users = await db.select().from(User);

  return NextResponse.json(users);
}