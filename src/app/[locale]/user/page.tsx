import { redirect } from 'next/navigation';

/** Голый `/user` на старом сайте никуда не вёл — отправляем в кабинет. */
export default function UserIndexPage() {
  redirect('/user/personal-area');
}
