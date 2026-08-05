import { Suspense } from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import ResetPasswordForm from './ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Новый пароль',
  robots: { index: false, follow: false },
};

/** Страница по ссылке из письма Strapi: `/reset-password?code=…`. */
export default async function ResetPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      <section className="archive-page">
        <div className="uk-container">
          <div className="uk-flex uk-flex-center uk-margin-large-top uk-margin-large-bottom">
            <div className="reg_wrap uk-width-1-1 uk-flex uk-flex-center uk-flex-wrap">
              <h2 className="modal-head">Новый пароль</h2>
              {/* useSearchParams требует границы Suspense при пререндере */}
              <Suspense fallback={null}>
                <ResetPasswordForm />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
