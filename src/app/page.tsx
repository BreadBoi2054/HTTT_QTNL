import { redirect } from "next/navigation";

export default function Home() {
  // Redirect thẳng vào dashboard
  redirect("/dashboard");
}
