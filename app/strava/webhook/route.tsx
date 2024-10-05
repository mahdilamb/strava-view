
import { readSecrets } from '@/lib/secrets';
import type { StravaSecrets } from '@/lib/strava-service/authorization';
import dynamic from 'next/dynamic';

import { NextRequest, NextResponse } from 'next/server'
export const revalidate = 0;



export async function GET(request: NextRequest) {
    const VERIFY_TOKEN = (await readSecrets<StravaSecrets>("strava")).VerifyToken;
    const params: URLSearchParams = request.nextUrl.searchParams
    const mode = params.get('hub.mode')
    let token = params.get('hub.verify_token');
    let challenge = params.get('hub.challenge');
    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            return NextResponse.json({ "hub.challenge": challenge }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
        } else {
            return NextResponse.json({}, { status: 403, headers: { 'Cache-Control': 'no-store' } })
        }
    }
    return NextResponse.json({ 'error': 'Requires strava hub details' }, { status: 404, headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: NextRequest) {
    console.log("webhook event received!", await request.json());
    return NextResponse.json({ 'message': 'EVENT_RECEIVED' }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
}
