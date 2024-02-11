import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";

import { TestUnpopulated } from "@/types/Test";
import { getTestById } from "@api/test";
import Quiz from "@components/quiz";
import QuizDescription from "@components/quizDescription";
import Layout from "@components/layout";
import Loader from "@components/loader";

function TestPage(): JSX.Element {
  const [confirmPlay, setConfirmPlay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quiz, setQuiz] = useState<TestUnpopulated>();

  const router = useRouter();

  useEffect(() => {
    async function getInitialData() {
      setIsLoading(true);
      const { testId = "" } = router.query;

      if (!testId) return;

      const testInfo = await getTestById({ testId: testId as string });

      setQuiz(testInfo);
      setIsLoading(false);
    }

    getInitialData();
  }, [router]);

  const component = useMemo(() => {
    if (!quiz) return;

    const { description, questions, title, createdAt, _id } = quiz;

    if (confirmPlay) return <Quiz testId={_id} items={questions} />;

    return (
      <Loader
        isLoading={isLoading}
        component={
          <QuizDescription
            _id={_id}
            createdAt={createdAt}
            description={description}
            questions={questions}
            title={title}
            onConfirm={setConfirmPlay}
          />
        }
      />
    );
  }, [confirmPlay, quiz, isLoading]);

  return <Layout>{component}</Layout>;
}

export default TestPage;
