"use client"

import { useEffect, useState } from "react";
import { authUrl } from "../strava-service";
import { AuthTokenDetails, refreshToken } from "../strava-service/authorization";
import { initDB, lastSynchronization, StravaDB, StravaDBv1, syncDB, syncDetails } from "./sync";
import { IDBPDatabase } from "idb";
import { ActivitiesApi, Configuration } from "@/strava";


export const STORAGE_KEY = "stravaAuth";
type ServiceStatus = undefined | 'loggedOut' | "ready" | "syncing"
type StravaService = { status: ServiceStatus } & {
    authUrl?: string,
    db?: StravaDB,
    lastSynchronized?: Date,
    sync?: () => Promise<void>,
    syncDetails?: (ids?: number[]) => Promise<{ [id: number]: boolean }>
} & ({
    status: undefined,
} | {
    status: 'loggedOut',
    authUrl: string,
} | {
    status: "ready" | "syncing",
    db: StravaDB,
    api: ActivitiesApi,
    lastSynchronized: Date | undefined,
    sync: () => Promise<void>,
    syncDetails: (ids?: number[]) => Promise<{ [id: number]: boolean }>
})



export const useStrava = (): StravaService => {
    const [stravaAuthUrl, setStravaAuthUrl] = useState<string | undefined>(undefined);
    const [authToken, setAuthToken] = useState<AuthTokenDetails | undefined>(undefined);
    const [synced, setSynced] = useState(true)
    const [stravaDb, setStravaDb] = useState<StravaDB | undefined>(undefined)
    const [lastSynchronized, setLastSynchronized] = useState<Date | undefined>(undefined)
    const api = authToken ? new ActivitiesApi(
        new Configuration({
            headers: { Authorization: `Bearer ${authToken.access_token}` },

        }),
    ) : undefined

    useEffect(() => {
        const getAuthUrl = async () => {
            setStravaAuthUrl(await authUrl())
        }
        getAuthUrl()
    }, [])
    useEffect(() => {
        const checkAuth = async () => {
            if (!stravaAuthUrl) {
                return
            }
            var potentialAuth;
            if (
                (potentialAuth = JSON.parse(
                    localStorage.getItem(STORAGE_KEY) || "{}",
                )) &&
                "expires_at" in potentialAuth
            ) {
                if (new Date() < new Date(potentialAuth.expires_at * 1000)) {
                    setAuthToken(potentialAuth);
                    return;
                }
                setAuthToken(
                    await refreshToken(potentialAuth).then((token) => {
                        if ("errors" in token) {
                            throw JSON.stringify(token.errors);
                        }
                        console.debug("Refreshed token.");
                        return token;
                    }),
                );
            }
        };
        checkAuth();
    }, [stravaAuthUrl])
    useEffect(() => {
        if (!authToken) {
            return
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authToken));
    }, [authToken])
    useEffect(() => {
        const connectDb = async () => {
            if (authToken) {
                setStravaDb(await initDB())
            }
        }
        connectDb()
    }, [authToken])
    useEffect(() => {
        // const syncStrava = async () => {
        //     if (stravaDb && authToken) {
        //         await syncDB(stravaDb, authToken, () => localStorage.removeItem(STORAGE_KEY))
        //         setSynced(true)
        //     }
        // }
        // syncStrava()
    }, [authToken, stravaDb])
    useEffect(() => {
        const getLastSynchronization = async () => {
            if (stravaDb && authToken) {
                await setLastSynchronized((await lastSynchronization(stravaDb))?.completed)
            }
        }
        getLastSynchronization()
    }, [authToken, stravaDb])
    if (!stravaAuthUrl) {
        return { status: undefined }
    }
    if (!authToken) {
        return { status: 'loggedOut', authUrl: stravaAuthUrl }
    }
    return {
        status: synced ? 'ready' : 'syncing',
        db: stravaDb,
        api,
        lastSynchronized,
        sync: async () => {
            setSynced(false)
            await syncDB(stravaDb, authToken, () => localStorage.removeItem(STORAGE_KEY))
            setSynced(true)
        },
        syncDetails: async (ids?: number[]) => {
            setSynced(false)
            const result = await syncDetails(stravaDb, api, () => localStorage.removeItem(STORAGE_KEY), ids)
            setSynced(true)
            return result
        }
    }

}
