import { redirect } from "next/navigation";

export default function AdminLogoutPage() {
  redirect("/admin/login");
}
