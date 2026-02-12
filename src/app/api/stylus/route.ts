import { NextRequest, NextResponse } from 'next/server';
import * as stylus from 'stylus';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    const css = await new Promise<string>((resolve, reject) => {
      stylus.default.render(code, (err: any, css: string) => {
        if (err) reject(err);
        else resolve(css);
      });
    });

    return NextResponse.json({ css });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
