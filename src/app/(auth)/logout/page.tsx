import { signOut } from "../actions";

export default async function LogoutPage() {
  // Call the server action directly
  await signOut();

  // This won't be reached due to redirect in signOut
  return null;
}
