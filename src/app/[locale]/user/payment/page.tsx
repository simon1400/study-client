import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { strapiLocale } from '@/i18n/routing';
import { getContract, getSession } from '@/lib/account';
import PaymentPanel from '@/components/user/PaymentPanel';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'user.payment' });
  return { title: t('title'), robots: { index: false, follow: false } };
}

/** Оплата программы: банковский перевод и отметка о нём (макет «Оплата»). */
export default async function PaymentPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getSession();
  if (!user) redirect('/login');

  const t = await getTranslations({ locale });

  if (!user.contractSignedAt) {
    return (
      <div className="rounded-panel border border-line bg-white p-8 md:p-10">
        <p className="text-muted m-0">{t('user.payment.needContract')}</p>
        <Link href="/user/contract" className="btn btn-primary mt-5 !text-[15px]">
          {t('user.payment.toContract')}
        </Link>
      </div>
    );
  }

  const data = await getContract(strapiLocale(locale));
  if (!data?.contract) {
    return (
      <div className="rounded-panel border border-line bg-white p-8 md:p-10">
        <p className="text-muted m-0">{t('user.contract.empty')}</p>
      </div>
    );
  }

  return (
    <PaymentPanel user={user} contract={data.contract} bank={data.bank} locale={strapiLocale(locale)} />
  );
}
