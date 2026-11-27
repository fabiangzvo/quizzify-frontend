import { useState, useCallback, useMemo, useContext } from "react";
import moment from "moment";
import { Button } from "@heroui/react";
import { LuStar, LuX } from "react-icons/lu";

import QuestionComponent from "../question";
import ResumeComponent from "../resume";
import ThemeButton from "@components/themeButton";
import { postResume } from "@api/resume";
import { Question } from "@/types/Question";
import { Answer, CompleteResume } from "@/types/Resume";
import Loader from "@components/loader";
import { UserContext } from "@context/UserContext";

interface QuizProps {
  items?: Array<string>;
  testId: string;
  quizTitle?: string;
  onExit?: () => void;
}

function Quiz(props: QuizProps) {
  const { items = [], testId, quizTitle = "Cuestionario", onExit } = props;

  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [answers, setAnswers] = useState([] as Answer[]);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);
  const [resume, setResume] = useState<CompleteResume | null>(null);
  const [startTime] = useState(() => moment());

  const { user } = useContext(UserContext);

  const onConfirmOption = useCallback(
    async (question: Question, optionId: string | null) => {
      let lastAnswer: Answer;

      if (optionId === null) {
        lastAnswer = {
          optionId: null,
          questionId: question._id,
          isCorrect: false,
        };
      } else {
        const selectedOption = question.options.find(
          (option) => option._id === optionId,
        );

        if (!selectedOption) return;

        lastAnswer = {
          optionId: selectedOption._id,
          questionId: question._id,
          isCorrect: selectedOption.isCorrect,
        };

        if (selectedOption.isCorrect) {
          setEarnedPoints((prev) => prev + (question.points ?? 1000));
        }
      }

      const allAnswers = [...answers, lastAnswer];
      setAnswers(allAnswers);

      if (items.length - 1 > currentQuestion) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setIsFinished(true);

        const time = moment().diff(startTime, "s");
        const correctAnswers = allAnswers.filter((answer) => answer.isCorrect);
        const score = (correctAnswers.length / items.length) * 0.5 * 10;

        const [response] = await postResume({
          correctAnswers: correctAnswers.length,
          answers: allAnswers.filter((answer) => answer.optionId !== null),
          time,
          test: testId,
          user: user ? user._id : "",
          presentedAt: startTime.toISOString(),
          rating: Number(score.toFixed(2)) || 0,
        });

        setResume(response);
      }
    },
    [answers, currentQuestion, items.length, startTime, testId, user],
  );

  if (isFinished) {
    return (
      <Loader
        isLoading={!resume}
        component={
          resume && <ResumeComponent {...resume} earnedPoints={earnedPoints} />
        }
      />
    );
  }

  return (
    <div
      lang="es"
      className="min-h-screen flex flex-col bg-background text-foreground">
      {/* ════════════════════════ Top Progress Header ════════════════════════ */}
      <header className="w-full max-w-5xl mx-auto flex items-center gap-4 px-4 sm:px-8 pt-5 pb-3">
        <Button
          isIconOnly
          size="sm"
          radius="full"
          variant="bordered"
          onPress={onExit}
          aria-label="Salir del cuestionario"
          className="border-divider bg-content1 text-foreground hover:border-primary hover:text-primary shrink-0">
          <LuX size={16} />
        </Button>

        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-foreground truncate">
              {quizTitle}
            </span>
            {items.length > 0 && (
              <span className="text-default-400 shrink-0">
                Pregunta {currentQuestion + 1} de {items.length}
              </span>
            )}
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-1.5">
              {items.map((id, idx) => {
                const answered = answers[idx];
                let segmentColor = "bg-primary/20";

                if (answered) {
                  segmentColor = answered.isCorrect
                    ? "bg-emerald-500"
                    : "bg-rose-500";
                } else if (idx === currentQuestion) {
                  segmentColor = "bg-primary";
                }

                return (
                  <span
                    key={`${id}-${idx}`}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${segmentColor}`}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-divider bg-content1 px-3.5 py-1.5 text-xs font-bold text-foreground shadow-sm">
            <LuStar size={14} className="text-amber-500" />
            <span>{earnedPoints.toLocaleString("en-US")}</span>
            <span className="font-normal text-default-400">pts</span>
          </div>

          <ThemeButton />
        </div>
      </header>

      {/* ════════════════════════ Main Stage ════════════════════════ */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-6">
        {items.length === 0 ? (
          <p className="text-center text-sm text-default-500">
            Este cuestionario no tiene preguntas disponibles.
          </p>
        ) : (
          <QuestionComponent
            questionId={items[currentQuestion]}
            onConfirmOption={onConfirmOption}
          />
        )}
      </main>
    </div>
  );
}

export default Quiz;
