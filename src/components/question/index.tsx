import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Chip, Spinner } from "@heroui/react";

import { Question as QuestionType } from "@/types/Question";
import { Option } from "@/types/Option";
import useFetchData from "@hooks/useFetchData";
import { getQuestionById } from "@api/question";

interface QuestionProps {
  questionId: string;
  onConfirmOption: (question: QuestionType, optionId: string | null) => void;
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

const OPTION_BADGE_COLORS = [
  "bg-primary text-white",
  "bg-emerald-600 text-white",
  "bg-amber-600 text-white",
  "bg-rose-500 text-white",
  "bg-indigo-500 text-white",
  "bg-cyan-600 text-white",
];

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function Question({ questionId, onConfirmOption }: QuestionProps) {
  const [question, setQuestion] = useState<QuestionType | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const hasSubmittedRef = useRef(false);

  const getQuestion = useCallback(async () => {
    hasSubmittedRef.current = false;
    setSelectedOptionId(null);
    const response = await getQuestionById({ questionId });
    setQuestion(response);
    setTimeLeft(response.timeLimit ?? 30);
  }, [questionId]);

  const { loading } = useFetchData({ fetchData: getQuestion });

  const totalTime = question?.timeLimit ?? 30;
  const points = question?.points ?? 1000;

  const displayedOptions: Option[] = useMemo(() => {
    if (!question?.options) return [];
    if (question.shuffleOptions) {
      return shuffleArray(question.options);
    }
    return question.options;
  }, [question]);

  const isTrueFalse = useMemo(() => {
    if (displayedOptions.length !== 2) return false;
    const texts = displayedOptions.map((o) => o.description.trim().toLowerCase());
    return texts.includes("verdadero") && texts.includes("falso");
  }, [displayedOptions]);

  useEffect(() => {
    if (loading || !question || totalTime <= 0) return;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [loading, question, totalTime]);

  useEffect(() => {
    if (
      loading ||
      !question ||
      totalTime <= 0 ||
      timeLeft > 0 ||
      hasSubmittedRef.current
    ) {
      return;
    }

    hasSubmittedRef.current = true;
    onConfirmOption(question, null);
  }, [loading, question, totalTime, timeLeft, onConfirmOption]);

  const handleConfirm = () => {
    if (!question || !selectedOptionId || hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    onConfirmOption(question, selectedOptionId);
  };

  if (loading || !question) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Spinner color="primary" size="lg" />
        <p className="text-sm text-default-500">Cargando pregunta...</p>
      </div>
    );
  }

  const progressRatio = totalTime > 0 ? Math.max(0, timeLeft / totalTime) : 1;
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* ── Question Card ── */}
      <div className="rounded-2xl border border-divider bg-content1 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Chip
              size="sm"
              variant="flat"
              classNames={{
                base: "bg-primary/15",
                content:
                  "text-xs font-semibold text-primary-700 dark:text-primary-400",
              }}>
              {isTrueFalse ? "Verdadero / falso" : "Opción múltiple"}
            </Chip>

            <Chip
              size="sm"
              variant="flat"
              classNames={{
                base: "bg-amber-500/15",
                content:
                  "text-xs font-semibold text-amber-700 dark:text-amber-400",
              }}>
              {points.toLocaleString("en-US")} pts
            </Chip>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
            {question.description}
          </h2>
        </div>

        {/* Circular Timer */}
        {totalTime > 0 && (
          <div className="relative flex items-center justify-center w-20 h-20 shrink-0 self-center sm:self-auto">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
              <circle
                cx="36"
                cy="36"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                className="text-default-200 dark:text-default-100"
              />
              <circle
                cx="36"
                cy="36"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={`transition-all duration-500 ${
                  timeLeft <= 5 ? "text-danger" : "text-primary"
                }`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`text-lg font-bold leading-none ${
                  timeLeft <= 5 ? "text-danger" : "text-foreground"
                }`}>
                {timeLeft}
              </span>
              <span className="text-[10px] text-default-400 mt-0.5">seg</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Options Grid ── */}
      <div
        className={`grid grid-cols-1 gap-3.5 ${
          isTrueFalse
            ? "sm:grid-cols-2"
            : "sm:grid-cols-2 lg:grid-cols-3"
        }`}>
        {displayedOptions.map((option, idx) => {
          const isSelected = selectedOptionId === option._id;
          const letter = OPTION_LETTERS[idx] ?? String(idx + 1);
          const badgeColor =
            OPTION_BADGE_COLORS[idx % OPTION_BADGE_COLORS.length];

          return (
            <button
              key={option._id}
              type="button"
              onClick={() => setSelectedOptionId(option._id)}
              className={`flex items-center gap-3.5 rounded-2xl border p-4 sm:p-5 text-left transition-all cursor-pointer shadow-sm ${
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-divider bg-content1 hover:border-primary/40"
              }`}>
              <span
                className={`flex items-center justify-center w-9 h-9 rounded-xl text-sm font-bold shrink-0 ${badgeColor}`}>
                {letter}
              </span>
              <span className="text-sm sm:text-base font-medium text-foreground leading-snug">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Bottom Confirm Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <p className="text-xs sm:text-sm text-default-400">
          {selectedOptionId
            ? "Opción seleccionada · confirma para continuar"
            : "Elige una respuesta"}
        </p>

        <Button
          color="primary"
          radius="full"
          isDisabled={!selectedOptionId}
          onPress={handleConfirm}
          className="h-11 px-7 font-semibold text-sm text-white shadow-sm">
          Confirmar respuesta
        </Button>
      </div>
    </div>
  );
}

export default Question;
