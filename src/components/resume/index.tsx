import { useMemo, useCallback, MouseEventHandler } from "react";
import { useRouter } from "next/router";
import moment from "moment";

import { CompleteResume } from "@/types/Resume";
import Button from "@components/button";

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
    <div className="w-full h-auto flex flex-col items-center justify-evenly max-lg:p-5">
      <h1 className="text-xl font-bold text-center">{test?.title}</h1>
      <p className="text-lg my-10 text-center text-paragraph">
        {test.description}
      </p>
      <ResumeList items={items} />
      <Button classes="mt-10" handleClick={handleClick} label="Finish" />
    </div>
  );
}

export default ResumeComponent;
