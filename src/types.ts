export interface GeoLocationResponse {
    status: "success" | "fail";
    country: string;
    countryCode: string;
    region: string;
    regionName: string;
    city: string;
    zip: string;
    lat: number;
    lon: number;
    timezone: string;
    isp: string;
    org: string;
    as: string;
    query: string;
}


export interface InvitationData {
    email: string;
    status: "pending" | "accepted" | "revoked" | "expired";
    failedAttempts?: number;
    invitedBy?: string;
    createdAt?: string;
    expiresAt?: string;
}