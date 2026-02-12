import ddb from "@/utils/db/mysql";
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const [categories] = await ddb.query<RowDataPacket[]>("SELECT * FROM categories");
    const [subcategories] = await ddb.query<RowDataPacket[]>("SELECT * FROM subcategories");

    const noResults =
      (!Array.isArray(categories) || categories.length === 0) &&
      (!Array.isArray(subcategories) || subcategories.length === 0);

    if (noResults) {
      return NextResponse.json({ error: "No categories or subcategories found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          categories,
          subcategories,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Database error", details: message }, { status: 500 });
  }
}
