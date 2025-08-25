export interface User{
    userId: string;
    displayName: string;
    email: string;
    profilePic: string;
    userRole: "citizen" | "admin" | "personnel" | "super-admin";
    createdAt: Date;
    statusId: string;
}
