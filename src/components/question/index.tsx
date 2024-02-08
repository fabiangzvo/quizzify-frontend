import { useCallback, useState, MouseEventHandler, MouseEvent } from "react";

import { Question } from "@/types/Question";
import useFetchData from "@hooks/useFetchData";
import { getQuestionById } from "@api/question";
import Loader from "@components/loader";

interface QuestionProps {
  questionId: string;
  isFinished: boolean;
  onSelectOption: (
    question: Question,
    event: MouseEvent<HTMLButtonElement>
  ) => void;
}

function Question(props: QuestionProps) {
  const { questionId, onSelectOption } = props;
  const [question, setQuestion] = useState<Question | null>(null);

  const getQuestion = useCallback(async () => {
    const response = await getQuestionById({ questionId });

    setQuestion(response);
  }, [questionId]);

  const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      e.preventDefault();

      question && onSelectOption(question, e);
    },
    [onSelectOption, question]
  );
  const { loading } = useFetchData({ fetchData: getQuestion });

  return (
    <Loader
      isLoading={loading}
      component={
        <div className="h-full w-full flex flex-col justify-center items-center">
          <p className="text-xl font-bold">{question?.description}</p>
          <div className="w-full h-auto mt-10">
            <ul>
              {question?.options.map((option) => (
                <li key={option._id} className="w-full my-5">
                  <button
                    value={option._id}
                    onClick={handleClick}
                    className="text-lg w-full border border-gray-600 hover:shadow-lg hover:shadow-gray-900 rounded-xl py-5 px-5 cursor-pointer"
                  >
                    {option.description}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      }
    />
  );
}

export default Question;
