import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { strapiLocale } from '@/i18n/routing';
import { getContract, getSession } from '@/lib/account';
import ContractSign from '@/components/user/ContractSign';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'user.contract' });
  return { title: t('title'), robots: { index: false, follow: false } };
}

/** Страница договора: текст шаблона слева, подписание справа (макет «Договор»). */
export default async function ContractPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getSession();
  if (!user) redirect('/login');

  const t = await getTranslations({ locale });

  if (!user.programmSelected) {
    return (
      <Notice text={t('user.contract.needProgram')}>
        <Link href="/user" className="btn btn-primary !text-[15px]">
          {t('user.contract.toProgram')}
        </Link>
      </Notice>
    );
  }

  const data = await getContract(strapiLocale(locale));
  const contract = data?.contract ?? null;
  if (!contract) return <Notice text={t('user.contract.empty')} />;

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[1fr_340px]">
      <article className="rounded-panel border border-line bg-white p-6 md:px-11 md:py-9">
        <header className="text-center">
          <div className="text-xs font-bold tracking-[0.08em] text-faint uppercase">{contract.number}</div>
          <h1 className="font-display mt-2 mb-1 text-[18px] font-semibold text-ink md:text-[19px]">
            {contract.title}
          </h1>
          <div className="text-faint text-[13px]">
            {[contract.city, contract.date].filter(Boolean).join(', ')}
          </div>
        </header>

        <div className="my-6 h-px bg-line" />

        <div className="grid gap-4 text-sm text-body">
          {contract.sections.map((section) => (
            <div key={section.title}>
              <div className="mb-1 font-bold text-ink">{section.title}</div>
              {section.body}
            </div>
          ))}
        </div>

        <div className="my-6 h-px bg-line" />

        <div className="grid gap-5 text-[13px] text-muted sm:grid-cols-2">
          <div>
            <div className="mb-1 font-bold text-ink">{t('user.contract.executor')}</div>
            {[contract.executor.name, contract.executor.address, contract.executor.email]
              .filter(Boolean)
              .map((line) => (
                <div key={line}>{line}</div>
              ))}
          </div>
          <div>
            <div className="mb-1 font-bold text-ink">{t('user.contract.customer')}</div>
            <div>{contract.customer.name}</div>
            {contract.customer.number ? <div>№ {contract.customer.number}</div> : null}
            {contract.customer.email ? <div>{contract.customer.email}</div> : null}
          </div>
        </div>

        {contract.footerNote ? (
          <p className="text-faint mt-6 text-xs">{contract.footerNote}</p>
        ) : null}
      </article>

      <ContractSign contract={contract} locale={strapiLocale(locale)} signed={Boolean(user.contractSignedAt)} />
    </div>
  );
}

function Notice({ text, children }: { text: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-panel border border-line bg-white p-8 md:p-10">
      <p className="text-muted m-0">{text}</p>
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}
