import { useMemo, useCallback, MouseEventHandler } from "react";
import { useRouter } from "next/router";
import moment from "moment";

import { CompleteResume } from "@/types/Resume";
import { ListItemProps } from "./types";
import ResumeList from "./components/resumeList";

function ResumeComponent(props: CompleteResume) {
  const { correctAnswers, test, time, rating, presentedAt } = props;

  const router = useRouter();

  const items = useMemo<Array<ListItemProps>>(
    () => [
      {
        label: "Correct answers",
        value: correctAnswers,
      },
      {
        label: "Incorrect answers",
        value: test.questions.length - correctAnswers,
      },
      {
        label: "Time",
        value: <>{(time / 60).toFixed(2)} Min</>,
      },
      {
        label: "Score",
        value: rating.toFixed(2),
      },
      {
        label: "Presented at",
        value: moment(presentedAt).format("MM DD YYYY - HH:MM A"),
      },
    ],
    [correctAnswers, presentedAt, rating, test.questions.length, time]
  );

  const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    () => router.back(),
    [router]
  );

  return (
    <div className="w-full h-full flex flex-col items-center justify-evenly">
      <h1 className="text-xl font-bold">Resume of : &ensp;{test?.title}</h1>
      <p className="text-lg my-10 text-center">{test.description}</p>
      <ResumeList items={items} />
      <button
        onClick={handleClick}
        type="button"
        className="mt-10 py-2.5 px-10 text-lg font-medium focus:outline-none rounded-full border border-gray-600 focus:z-10 hover:bg-gray-800"
      >
        Finish
      </button>
    </div>
  );
}

export default ResumeComponent;
