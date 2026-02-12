import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import ddb from "@/utils/db/mysql";

export async function GET() {
  try {
    const [rows] = await ddb.query<RowDataPacket[]>("SELECT * FROM users");

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No users found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Database error", details: process.env.DB_HOST }, { status: 500 });
  }
}
