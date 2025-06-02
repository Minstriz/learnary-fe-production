import { routing } from "@/i18n/routing";
import { redirect } from "next/navigation";

export default function Home() {
  return redirect(`/${routing.defaultLocale}`); // Redirect to the English version of the site
}
