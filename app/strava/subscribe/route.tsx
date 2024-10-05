
import dynamic from 'next/dynamic';

import { NextRequest, NextResponse } from 'next/server'


export async function GET(request: NextRequest) {
    const params: URLSearchParams = request.nextUrl.searchParams
    return NextResponse.json({ "hub.challenge": params.get('hub.challenge') }, { status: 200 })
}

export async function POST(request: NextRequest) {
    console.log(await request.json())
    return NextResponse.json({ }, { status: 200 })
}
