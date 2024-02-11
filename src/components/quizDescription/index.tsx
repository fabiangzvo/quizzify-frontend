import { useCallback, MouseEventHandler } from "react";
import { useRouter } from "next/router";
import moment from "moment";

import { TestUnpopulated } from "@/types/Test";
import Button from "@components/button";

interface QuizDescriptionProps extends Omit<TestUnpopulated, "topic"> {
  onConfirm: (value: boolean) => void;
}

function QuizDescription(props: QuizDescriptionProps) {
  const { description, questions, title, createdAt, onConfirm } = props;
  const router = useRouter();

  const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    () => onConfirm(true),
    [onConfirm]
  );

  const handleBack = useCallback<MouseEventHandler<HTMLButtonElement>>(
    () => router.push("/"),
    [router]
  );

  return (
    <div className="h-full max-lg:h-[90vh] max-lg:p-5 flex flex-col justify-center items-center">
      <h1 className="text-xl font-bold text-center">{title}</h1>
      <p className="text-lg my-10 text-center text-gray-400">{description}</p>
      <div className="w-full flex justify-around text-lg my-5 font-semibold">
        <span>Questions:&ensp;{questions.length}</span>
        <span>Created :&ensp;{moment(createdAt).format("MMM DD YYYY")}</span>
      </div>
      <div className="w-2/4 flex max-lg:w-full max-lg:flex-col justify-around mt-16">
        <Button
          handleClick={handleBack}
          classes="max-lg:mt-4 max-lg:order-2"
          label="Back"
        />
        <Button
          handleClick={handleClick}
          label="Start"
          classes="max-lg:order-1"
        />
      </div>
    </div>
  );
}

export default QuizDescription;
