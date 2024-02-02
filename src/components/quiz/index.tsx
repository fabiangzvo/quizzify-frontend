import { useState, useCallback, MouseEvent, useMemo } from "react";
import moment from "moment";

import QuestionComponent from "../question";
import ResumeComponent from "../resume";
import { postResume } from "@api/resume";
import { Question } from "@/types/Question";
import { Answer, CompleteResume } from "@/types/Resume";
import Loader from "@components/loader";

interface QuizProps {
  items: Array<string>;
  testId: string;
}

function Quiz(props: QuizProps) {
  const { items, testId } = props;

  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [answers, setAnswers] = useState([] as Answer[]);
  const [resume, setResume] = useState<CompleteResume | null>(null);
  const [startTime, _] = useState(() => moment());

  const onSelectOption = useCallback(
    async (question: Question, e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      const { options } = question;
      const { value } = e.currentTarget;

      const selectedOption = options.find((option) => option._id === value);

      if (selectedOption) {
        setAnswers([
          ...answers,
          {
            optionId: selectedOption._id,
            questionId: question._id,
            isCorrect: selectedOption.isCorrect,
          },
        ]);
        if (items.length - 1 > currentQuestion) {
          setCurrentQuestion(currentQuestion + 1);
        } else {
          setIsFinished(true);

          const time = moment().diff(startTime, "s");
          const correctAnswers = answers.filter((answer) => answer.isCorrect);
          const rating = correctAnswers.length
            ? correctAnswers.length / items.length
            : 0;

          const [response] = await postResume({
            correctAnswers: correctAnswers.length,
            answers,
            time,
            test: testId,
            presentedAt: startTime.toISOString(),
            rating: Number(rating.toFixed(2)) || 0,
          });

          setResume(response);
        }
      }
    },
    [answers, currentQuestion, items.length, startTime, testId]
  );

  const component = useMemo(() => {
    if (!isFinished || !resume)
      return (
        <QuestionComponent
          questionId={items[currentQuestion]}
          onSelectOption={onSelectOption}
          isFinished={isFinished}
        />
      );

    return (
      <Loader
        isLoading={isFinished && !resume}
        component={<ResumeComponent {...resume} />}
      />
    );
  }, [currentQuestion, isFinished, items, onSelectOption, resume]);

  return (
    <div className="w-2/4 h-[80vh] flex flex-col justify-evenly items-center p-10 border border-gray-600 rounded-xl shadow-gray-900">
      {component}
    </div>
  );
}

export default Quiz;
