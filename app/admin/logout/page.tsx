import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME } from "@/lib/auth";

export default function AdminLogoutPage() {
  cookies().set({ name: ADMIN_COOKIE_NAME, value: "", maxAge: 0, path: "/" });
  redirect("/admin/login");
}
