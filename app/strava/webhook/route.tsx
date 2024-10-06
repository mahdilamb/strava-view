
import { readSecrets } from '@/lib/secrets';
import { socketClients } from '@/lib/sockets';
import type { StravaSecrets } from '@/lib/strava-service/authorization';
import { WebhookEvent } from '@/lib/strava/webhook';

import { NextRequest, NextResponse } from 'next/server';
export const revalidate = 0;


export async function GET(request: NextRequest) {
    const VERIFY_TOKEN = (await readSecrets<StravaSecrets>("strava")).VerifyToken;
    const params: URLSearchParams = request.nextUrl.searchParams
    const mode = params.get('hub.mode')
    let token = params.get('hub.verify_token');
    let challenge = params.get('hub.challenge');
    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            return NextResponse.json({ "hub.challenge": challenge }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
        }
        return NextResponse.json({}, { status: 403, headers: { 'Cache-Control': 'no-store' } })
    }
    return NextResponse.json({ 'error': 'Requires strava hub details' }, { status: 404, headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: NextRequest) {
    const event: WebhookEvent = await request.json()
    const { owner_id: athleteId } = event
    console.log("webhook event received!", event);
    (global as any).SOCKET_CLIENTS.notifySocket(athleteId, JSON.stringify(event))
    return NextResponse.json({ 'message': 'EVENT_RECEIVED' }, { status: 200, headers: { 'Cache-Control': 'no-store' } })
}
