"use server";

import { mainUrl } from "@/helper/constants/env-variables";
import { cookies } from "next/headers";

export const getUser = async () => {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    if (token) {
        const data: any = await fetch(`${mainUrl}/user`, {
            headers: {
                "x-Access-Token": token!,
            },
        });
        const user = await data.json();
        return user;
    }
};
export const getInquiry = async (code:number) => {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    if (token) {
        const data: any = await fetch(`${mainUrl}/driver/${code}`, {
            headers: {
                "x-Access-Token": token!,
            },
        });
        const driver = await data.json();
        return driver;
    }
};



