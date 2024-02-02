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
    <div className="w-2/4 h-[80vh] flex flex-col justify-center items-center p-10 border border-gray-600 rounded-xl shadow-gray-900">
      <h1 className="text-xl font-bold text-center">
        Welcome to <br />
        {title}
      </h1>

      <p className="text-lg my-10 text-center text-gray-400">{description}</p>
      <div className="w-full flex justify-around text-lg my-5 font-semibold">
        <span>Questions:&ensp;{questions.length}</span>
        <span>Created :&ensp;{moment(createdAt).format("MMM DD YYYY")}</span>
      </div>
      <div className="w-2/4 flex justify-around mt-16">
        <button
          type="button"
          onClick={handleBack}
          className="py-2.5 px-10 me-2 mb-2 text-lg font-medium focus:outline-none rounded-full border border-gray-600 focus:z-10 hover:bg-gray-800"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleClick}
          className="py-2.5 px-10 me-2 mb-2 text-lg font-medium focus:outline-none rounded-full border border-gray-600 focus:z-10 hover:bg-gray-800"
        >
          Start
        </button>
      </div>
    </div>
  );
}

export default QuizDescription;
