import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { strapiLocale } from '@/i18n/routing';
import { getQuestionnaire } from '@/lib/account';
import { getSingle } from '@/lib/strapi';
import type { Global } from '@/types/strapi';
import { cabinetProgress, QUESTIONNAIRE_STEPS } from '@/lib/cabinet';
import { storageStep, withDefaults, STEP_TITLE_KEYS } from '@/lib/questionnaire';
import QuestionnaireNav from '@/components/user/QuestionnaireNav';
import Step1Form from '@/components/user/steps/Step1Form';
import Step2Form from '@/components/user/steps/Step2Form';
import Step3Form from '@/components/user/steps/Step3Form';
import Step4Form from '@/components/user/steps/Step4Form';
import Step5Form from '@/components/user/steps/Step5Form';
import Step6Form from '@/components/user/steps/Step6Form';

/** Адреса те же, что на старом сайте: `/user/questionnaire/step-1` … `step-6`. */
function parsePosition(segment: string): number | null {
  const match = /^step-([1-6])$/.exec(segment);
  return match ? Number(match[1]) : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; step: string }>;
}): Promise<Metadata> {
  const { locale, step: segment } = await params;
  const position = parsePosition(segment);
  const storage = position ? storageStep(position) : null;
  const t = await getTranslations({ locale });

  return {
    title: storage
      ? `${t('user.nav.questionnaire')} — ${t(`user.steps.${STEP_TITLE_KEYS[storage]}`)}`
      : t('user.nav.questionnaire'),
    robots: { index: false, follow: false },
  };
}

export default async function QuestionnaireStepPage({
  params,
}: {
  params: Promise<{ locale: string; step: string }>;
}) {
  const { locale, step: segment } = await params;
  setRequestLocale(locale);

  const position = parsePosition(segment);
  const storage = position ? storageStep(position) : null;
  if (!position || !storage) notFound();

  const data = await getQuestionnaire();
  if (!data) redirect('/login');

  const { user, questionnaire } = data;
  const [t, global] = await Promise.all([
    getTranslations({ locale }),
    getSingle<Global>('global', { locale: strapiLocale(locale), query: { populate: '*' } }),
  ]);

  const progress = cabinetProgress(user);
  const percent = Math.round((progress.questionnaireDone / QUESTIONNAIRE_STEPS) * 100);

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[1fr_300px]">
      <section className="rounded-panel overflow-hidden border border-line bg-white">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-6 py-5 md:px-8">
          <div>
            <div className="text-xs font-bold tracking-[0.08em] text-faint uppercase">
              {t('user.questionnaire.stepOf', { step: position, total: QUESTIONNAIRE_STEPS })}
            </div>
            <h1 className="font-display m-0 mt-1.5 text-[18px] font-semibold text-ink">
              {t(`user.steps.${STEP_TITLE_KEYS[storage]}`)}
            </h1>
          </div>
          <span className="badge !font-bold">{t('user.questionnaire.filled', { percent })}</span>
        </header>

        <div className="px-6 py-6 md:px-8 md:py-7">
          {storage === 1 ? <Step1Form initial={withDefaults(1, questionnaire.step1)} position={position} /> : null}
          {storage === 2 ? <Step2Form initial={withDefaults(2, questionnaire.step2)} position={position} /> : null}
          {storage === 3 ? <Step3Form initial={withDefaults(3, questionnaire.step3)} position={position} /> : null}
          {storage === 4 ? <Step4Form initial={withDefaults(4, questionnaire.step4)} position={position} /> : null}
          {storage === 5 ? <Step5Form initial={withDefaults(5, questionnaire.step5)} position={position} /> : null}
          {storage === 6 ? <Step6Form initial={withDefaults(6, questionnaire.step6)} position={position} /> : null}
        </div>
      </section>

      <QuestionnaireNav
        position={position}
        filled={progress.questionnaireDone}
        supportEmail={global?.contacts?.email ?? 'info@studycz.cz'}
        supportPhone={global?.contacts?.phone ?? null}
      />
    </div>
  );
}
