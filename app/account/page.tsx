import { redirect } from "next/navigation";
import { getToken } from "@/lib/session";
import { fetchCurrentUser } from "@/lib/api";
import AccountForm from "@/components/AccountForm";

export default async function AccountPage() {
  const token = await getToken();
  if (!token) redirect("/login?next=/account");

  const user = await fetchCurrentUser(token);
  if (!user) redirect("/login?next=/account");

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="font-display text-2xl text-cocoa mb-6">Your account</h1>
      <AccountForm user={user} />
    </main>
  );
}
