import { useState, useCallback, MouseEvent, useMemo, useContext } from "react";
import moment from "moment";

import QuestionComponent from "../question";
import ResumeComponent from "../resume";
import { postResume } from "@api/resume";
import { Question } from "@/types/Question";
import { Answer, CompleteResume } from "@/types/Resume";
import Loader from "@components/loader";
import { UserContext } from "@context/UserContext";

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

  const { user } = useContext(UserContext);

  const onSelectOption = useCallback(
    async (question: Question, e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      const { options } = question;
      const { value } = e.currentTarget;

      const selectedOption = options.find((option) => option._id === value);

      if (selectedOption) {
        const lastAnswer = {
          optionId: selectedOption._id,
          questionId: question._id,
          isCorrect: selectedOption.isCorrect,
        };

        const allAnswers = [...answers, lastAnswer];

        setAnswers(allAnswers);

        if (items.length - 1 > currentQuestion) {
          setCurrentQuestion(currentQuestion + 1);
        } else {
          setIsFinished(true);

          const time = moment().diff(startTime, "s");
          const correctAnswers = allAnswers.filter(
            (answer) => answer.isCorrect
          );
          const score = (correctAnswers.length / items.length) * 0.5 * 10;

          const [response] = await postResume({
            correctAnswers: correctAnswers.length,
            answers: allAnswers,
            time,
            test: testId,
            user: user ? user._id : "",
            presentedAt: startTime.toISOString(),
            rating: Number(score.toFixed(2)) || 0,
          });

          setResume(response);
        }
      }
    },
    [answers, currentQuestion, items.length, startTime, testId, user]
  );

  const component = useMemo(() => {
    if (!isFinished)
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
        component={resume && <ResumeComponent {...resume} />}
      />
    );
  }, [currentQuestion, isFinished, items, onSelectOption, resume]);

  return component;
}

export default Quiz;
