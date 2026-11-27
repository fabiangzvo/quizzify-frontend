import { useRouter } from "next/router";

import QuizBuilder from "@components/quizBuilder";

export default function EditQuizPage() {
  const router = useRouter();
  const testId =
    typeof router.query.testId === "string" ? router.query.testId : undefined;

  if (!router.isReady || !testId) {
    return null;
  }

  return <QuizBuilder testId={testId} />;
}
