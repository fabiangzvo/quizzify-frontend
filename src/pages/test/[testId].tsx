import { useState, useEffect, useContext } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Spinner } from "@heroui/react";

import { TestUnpopulated } from "@/types/Test";
import { getTestById, getTestDetails } from "@api/test";
import Quiz from "@components/quiz";
import QuizDescription from "@components/quizDescription";
import { AuthContext } from "@context/AuthContext";

function TestPage(): JSX.Element | null {
  const [confirmPlay, setConfirmPlay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quiz, setQuiz] = useState<TestUnpopulated>();

  const router = useRouter();
  const { refreshAuthContext, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    refreshAuthContext();
    const hasToken = !!window.localStorage.getItem("token");
    if (!hasToken) {
      router.push("/auth/signIn");
    }
  }, [router, refreshAuthContext]);

  useEffect(() => {
    async function getInitialData() {
      const { testId = "" } = router.query;
      if (!testId || typeof testId !== "string") return;

      setIsLoading(true);
      try {
        const testInfo = await getTestDetails({ testId });
        setQuiz(testInfo);
      } finally {
        setIsLoading(false);
      }
    }

    if (router.isReady && isAuthenticated) {
      getInitialData();
    }
  }, [router.isReady, router.query, isAuthenticated]);

  const handleConfirmPlay = async (shouldPlay: boolean) => {
    if (!shouldPlay || !quiz) {
      setConfirmPlay(false);
      return;
    }

    if (!quiz.questions || quiz.questions.length === 0) {
      setIsLoading(true);
      try {
        const fullTest = await getTestById({ testId: quiz._id });
        setQuiz((prev) =>
          prev
            ? { ...prev, questions: fullTest.questions ?? [] }
            : fullTest,
        );
      } finally {
        setIsLoading(false);
      }
    }

    setConfirmPlay(true);
  };

  if (!isAuthenticated) return null;

  if (isLoading || !quiz) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background text-foreground">
        <Spinner color="primary" size="lg" />
        <p className="text-sm text-default-500">Cargando cuestionario...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{quiz.title} | Quizzify</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/lightBrain.svg" sizes="any" />
      </Head>

      {confirmPlay ? (
        <Quiz
          testId={quiz._id}
          items={quiz.questions}
          quizTitle={quiz.title}
          onExit={() => setConfirmPlay(false)}
        />
      ) : (
        <QuizDescription {...quiz} onConfirm={handleConfirmPlay} />
      )}
    </>
  );
}

export default TestPage;
