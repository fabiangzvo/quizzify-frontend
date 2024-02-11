import { useMemo } from "react";
import moment from "moment";

import { Resume } from "@/types/Resume";
import { ListItemProps } from "@components/resume/types";

function ResumeItem(props: Resume) {
  const { test, time, rating, correctAnswers, presentedAt, answers } = props;

  const title = typeof test !== "string" && test.title;

  const items = useMemo(() => {
    const items: Array<ListItemProps> = [
      {
        label: "Time",
        value: <>{(time / 60).toFixed(2)} Min</>,
      },
      {
        label: "Score",
        value: rating.toFixed(2),
      },
      {
        label: "Answers",
        value: (
          <>
            {correctAnswers}/{answers.length}
          </>
        ),
      },
      {
        label: "Presented at",
        value: moment(presentedAt).format("MM DD YYYY - HH:MM A"),
      },
    ];

    return items.map(({ label, value }, key) => (
      <div
        key={key}
        className="flex flex-col mt-5 justify-center items-center mx-5"
      >
        <span className="font-bold">{label}</span>
        <p className="text-lg">{value}</p>
      </div>
    ));
  }, [answers.length, correctAnswers, presentedAt, rating, time]);

  return (
    <li className="border border-paragraph shadow-lg shadow-paragraph rounded-lg p-10 m-5 max-lg:p-4">
      <h1 className="text-xl text-center font-bold max-lg:w-full ">{title}</h1>
      <div className="flex w-full justify-center flex-wrap">{items}</div>
    </li>
  );
}

export default ResumeItem;
