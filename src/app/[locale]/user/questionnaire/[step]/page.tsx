import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getQuestionnaire } from '@/lib/account';
import { isStepNumber, withDefaults, STEP_TITLES, type StepNumber } from '@/lib/questionnaire';
import RightSidebar from '@/components/user/RightSidebar';
import Step1Form from '@/components/user/steps/Step1Form';
import Step2Form from '@/components/user/steps/Step2Form';
import Step3Form from '@/components/user/steps/Step3Form';
import Step4Form from '@/components/user/steps/Step4Form';
import Step5Form from '@/components/user/steps/Step5Form';
import Step6Form from '@/components/user/steps/Step6Form';

/** Адреса те же, что на старом сайте: `/user/questionnaire/step-1` … `step-6`. */
function parseStep(segment: string): StepNumber | null {
  const match = /^step-([1-6])$/.exec(segment);
  if (!match) return null;
  const value = Number(match[1]);
  return isStepNumber(value) ? value : null;
}

export default async function QuestionnaireStepPage({
  params,
}: {
  params: Promise<{ locale: string; step: string }>;
}) {
  const { locale, step: segment } = await params;
  setRequestLocale(locale);

  const step = parseStep(segment);
  if (!step) notFound();

  const data = await getQuestionnaire();
  if (!data) redirect('/');

  const { user, questionnaire } = data;
  const shared = { stepQuestionare: user.stepQuestionare };

  return (
    <>
      {step === 1 ? <Step1Form initial={withDefaults(1, questionnaire.step1)} {...shared} /> : null}
      {step === 2 ? <Step2Form initial={withDefaults(2, questionnaire.step2)} {...shared} /> : null}
      {step === 3 ? <Step3Form initial={withDefaults(3, questionnaire.step3)} {...shared} /> : null}
      {step === 4 ? <Step4Form initial={withDefaults(4, questionnaire.step4)} {...shared} /> : null}
      {step === 5 ? <Step5Form initial={withDefaults(5, questionnaire.step5)} {...shared} /> : null}
      {step === 6 ? <Step6Form initial={withDefaults(6, questionnaire.step6)} {...shared} /> : null}
      <RightSidebar />
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ step: string }>;
}): Promise<Metadata> {
  const { step: segment } = await params;
  const step = parseStep(segment);
  return { title: step ? `Анкета — ${STEP_TITLES[step]}` : 'Анкета' };
}
