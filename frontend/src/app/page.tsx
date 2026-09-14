import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function RootPage() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get('sgf_auth_token')?.value ||
    cookieStore.get('token')?.value;

  if (token) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
