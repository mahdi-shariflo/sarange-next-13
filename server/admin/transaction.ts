"use server";
import jwt_decode from "jwt-decode";
import { mainUrl } from "@/helper/constants/env-variables";
import route from "@/helper/routes/apiRoutes";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";

export const getList = async (q: string, skip: string) => {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    if (token) {
        const data: any = await fetch(`${mainUrl}${route.admin.transactions}${q ? `&q=${q}` : ""}&skip=${skip ?? "0"}`, {
            headers: {
                "x-access-token": token!,
            },
            next: {
                tags: ["driver-list"],
            },
        });
        const result = await data.json();
        return result;
    }
};

export const getPermissions = async () => {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    if (token) {
        // @ts-ignore
        const decodeCode: any = jwt_decode(token);
        const data: any = await fetch(`${mainUrl}${route.admin.get_permissionsTransactions}${decodeCode.userId}`, {
            headers: {
                "x-access-token": token!,
            },
        });
        const permissions = await data.json();
        return permissions;
    }
};

export const getTransactionsListWithPermissions = async (q: string, skip: string) => {
    const [data, permisstion] = await Promise.all([getList(q, skip), getPermissions()]);
    const headerItems: any = [];
    const dataTable: any = [];
    for (let i = 0; i < data.Transactions?.length; i++) {
        for (let j = 0; j < permisstion[0].Attributes?.length; j++) {
            if (permisstion[0].Attributes[j].Name === "آیدی") continue;
            headerItems.push({
                headerName: permisstion[0].Attributes[j].Name,
                field: permisstion[0].Attributes[j].Value,
                flex: 1,
                align: "center",
                justifyContent: "center",
                headerClassName: "font-artin-bold",
            });
        }
        dataTable.push({ ...data.Transactions[i], id: i + 1 });
    }
    // @ts-ignore
    const Headers = Array.from(new Set(headerItems.map(JSON.stringify))).map(JSON.parse);
    const check = permisstion.filter((item: any) => item.Action !== "مشاهده");

    return {
        data: dataTable,
        Total: data.Total,
        Headers:
            check?.length >= 1
                ? [
                      {
                          headerName: "ردیف",
                          field: "id",
                          flex: 1,
                          align: "center",
                          justifyContent: "center",
                          headerClassName: "font-artin-bold",
                      },
                      ...Headers,
                  ]
                : [
                      {
                          headerName: "ردیف",
                          field: "id",
                          flex: 1,
                          align: "center",
                          justifyContent: "center",
                          headerClassName: "font-artin-bold",
                      },
                      ...Headers,
                  ],
        operation: {
            Total: check.length,
            create: permisstion.find((item: any) => item.Action === "ایجاد")?.Attributes,
            edit: permisstion.find((item: any) => item.Action == "ویرایش")?.Attributes,
            names: permisstion.filter((permisstion: any) => permisstion.Action !== "مشاهده").flatMap((item: any) => item.Action),
        },
    };
};
