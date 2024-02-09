import { useCallback, MouseEventHandler } from "react";
import { TestUnpopulated } from "@/types/Test";
import { useRouter } from "next/router";
import moment from "moment";

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
      <h1 className="text-xl font-bold text-center">
        Welcome to <br />
        {title}
      </h1>

      <p className="text-lg my-10 text-center text-gray-400">{description}</p>
      <div className="w-full flex justify-around text-lg my-5 font-semibold">
        <span>Questions:&ensp;{questions.length}</span>
        <span>Created :&ensp;{moment(createdAt).format("MMM DD YYYY")}</span>
      </div>
      <div className="w-2/4 flex max-lg:w-full max-lg:flex-col justify-around mt-16">
        <button
          type="button"
          onClick={handleBack}
          className="max-lg:w-full max-lg:mt-4 max-lg:order-2 py-2.5 px-10 me-2 mb-2 text-lg font-medium focus:outline-none rounded-full border border-gray-600 focus:z-10 hover:bg-gray-800"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleClick}
          className="max-lg:w-full max-lg:order-1 py-2.5 px-10 me-2 mb-2 text-lg font-medium focus:outline-none rounded-full border border-gray-600 focus:z-10 hover:bg-gray-800"
        >
          Start
        </button>
      </div>
    </div>
  );
}

export default QuizDescription;
