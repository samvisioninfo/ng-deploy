export class Profile {
    memberId ?: string;
    firstName ?: string;
    lastName ?: string;
    email ?: string;
    zipCode ?: number | string;
    addressName ?: string;
    description ?: string | null;
    images : any;
    googleToken ?: string;
    authToken ?: string;
    dateCreated ?: string;
    password ?: number | string;
    bought ?: number;
    sold ?: number;
    memberAvatar ?: string;
    rating ?: number;
    numberOfRatings ?: number;
}
