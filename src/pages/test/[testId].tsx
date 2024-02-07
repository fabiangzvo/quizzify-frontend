import { useState, useMemo } from "react";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";

import { TestUnpopulated } from "@/types/Test";
import { getTestById } from "@api/test";
import Quiz from "@components/quiz";
import QuizDescription from "@components/quizDescription";
import Layout from "@components/layout";

export const getServerSideProps = (async ({ query }) => {
  const testId = query?.testId as string;

  const testInfo = await getTestById({ testId });

  return { props: { ...testInfo } };
}) satisfies GetServerSideProps<TestUnpopulated>;

function TestPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
): JSX.Element {
  const { description, questions, title, createdAt, _id } = props;

  const [confirmPlay, setConfirmPlay] = useState(false);

  const component = useMemo(() => {
    if (confirmPlay) return <Quiz testId={_id} items={questions} />;

    return (
      <QuizDescription
        _id={_id}
        createdAt={createdAt}
        description={description}
        questions={questions}
        title={title}
        onConfirm={setConfirmPlay}
      />
    );
  }, [_id, confirmPlay, createdAt, description, questions, title]);

  return <Layout>{component}</Layout>;
}

export default TestPage;
