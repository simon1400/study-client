import { redirect } from 'next/navigation';

/** Старый адрес кабинета: в редизайне обзор живёт на `/user`. */
export default function PersonalAreaRedirect() {
  redirect('/user');
}
