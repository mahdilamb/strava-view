"use server";
import { readSecrets } from "../app/auth";
type FitbitSecrets = {
    ClientID: string;
    ClientSecret: string;
    RedirectURL: string
};
const sha25Digest = async (message: string) => await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message))
const base64Encode = (arrayBuffer: ArrayBufferLike) => btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer) as unknown as number[]));

const urlSafe = (unsafe: string) => unsafe.replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')




export const codeVerifierAndChallenge = async () => {
    const verifier = require('crypto').randomBytes(256).toString('hex').slice(0, 128)
    return [verifier, urlSafe(base64Encode(await sha25Digest(verifier)))]
}

export const authUrl = async (codeChallenge: string) => {
    const FITBIT_CLIENT = await readSecrets<FitbitSecrets>("fitbit");
    console.log(FITBIT_CLIENT)
    return `https://www.fitbit.com/oauth2/authorize?client_id=${FITBIT_CLIENT.ClientID}&response_type=code
    &code_challenge=${codeChallenge}&code_challenge_method=S256
    &scope=activity%20heartrate%20location%20nutrition%20oxygen_saturation%20profile
    %20respiratory_rate%20settings%20sleep%20social%20temperature%20weight`
}
