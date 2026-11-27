import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/router";
import moment from "moment";
import { Button } from "@heroui/react";
import {
  LuCheck,
  LuChevronDown,
  LuChevronLeft,
  LuChevronUp,
  LuClock,
  LuFlame,
  LuRotateCcw,
  LuStar,
  LuX,
} from "react-icons/lu";

import ThemeButton from "@components/themeButton";
import { CompleteResume } from "@/types/Resume";

interface ResumeComponentProps extends CompleteResume {
  earnedPoints?: number;
}

type AnswerFilter = "all" | "failed" | "correct";

function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function computeMaxStreak(items: Array<{ isCorrect: boolean }>): number {
  let max = 0;
  let current = 0;
  for (const item of items) {
    if (item.isCorrect) {
      current += 1;
      if (current > max) max = current;
    } else {
      current = 0;
    }
  }
  return max;
}

function ResumeComponent(props: ResumeComponentProps) {
  const {
    correctAnswers,
    test,
    time,
    rating,
    presentedAt,
    answers = [],
    earnedPoints,
  } = props;

  const router = useRouter();
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<AnswerFilter>("all");

  const questions = useMemo(() => test?.questions ?? [], [test?.questions]);
  const totalQuestions = questions.length || answers.length || 1;
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
  const incorrectCount = Math.max(0, totalQuestions - correctAnswers);
  const avgSeconds = Math.round(time / totalQuestions);

  const answerMap = useMemo(() => {
    const map = new Map<string, (typeof answers)[number]>();
    for (const ans of answers) {
      map.set(ans.questionId, ans);
    }
    return map;
  }, [answers]);

  const computedPoints = useMemo(() => {
    if (typeof earnedPoints === "number") return earnedPoints;
    return questions.reduce((sum, q, idx) => {
      const ans = answerMap.get(q._id) ?? answers[idx];
      return ans?.isCorrect ? sum + (q.points ?? 1000) : sum;
    }, 0);
  }, [earnedPoints, questions, answerMap, answers]);

  const allRows = useMemo(() => {
    if (questions.length > 0) {
      return questions.map((q, idx) => {
        const ans = answerMap.get(q._id) ?? answers[idx];
        const isCorrect = Boolean(ans?.isCorrect);
        const selectedOption = q.options?.find((o) => o._id === ans?.optionId);
        const correctOption = q.options?.find((o) => o.isCorrect);

        return {
          id: q._id ? `${q._id}-${idx}` : `question-${idx}`,
          index: idx + 1,
          description: q.description,
          selectedText: selectedOption?.description ?? "",
          correctText: correctOption?.description ?? "",
          explanation: q.explanation ?? "",
          points: isCorrect ? (q.points ?? 1000) : 0,
          isCorrect,
          wasAnswered: Boolean(ans && ans.optionId !== null),
        };
      });
    }

    return answers.map((ans, idx) => ({
      id: ans.questionId ? `${ans.questionId}-${idx}` : `answer-${idx}`,
      index: idx + 1,
      description: `Pregunta ${idx + 1}`,
      selectedText: "",
      correctText: "",
      explanation: "",
      points: ans.isCorrect ? 1000 : 0,
      isCorrect: ans.isCorrect,
      wasAnswered: ans.optionId !== null,
    }));
  }, [questions, answers, answerMap]);

  const maxStreak = useMemo(() => computeMaxStreak(allRows), [allRows]);

  const filteredRows = useMemo(() => {
    if (filter === "failed") return allRows.filter((r) => !r.isCorrect);
    if (filter === "correct") return allRows.filter((r) => r.isCorrect);
    return allRows;
  }, [allRows, filter]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleReviewFailed = useCallback(() => {
    setFilter("failed");
    const firstFailed = allRows.find((r) => !r.isCorrect);
    if (firstFailed) {
      setExpandedIds((prev) => ({ ...prev, [firstFailed.id]: true }));
    }
  }, [allRows]);

  const handleGoHome = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <div
      lang="es"
      className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-background text-foreground">
      {/* ════════════════════════ Left Column: Score & Stats ════════════════════════ */}
      <section className="flex flex-col justify-between px-6 py-7 sm:px-12 sm:py-8 lg:px-14 bg-content2 border-b lg:border-b-0 lg:border-r border-divider">
        {/* Top breadcrumb */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              isIconOnly
              size="sm"
              radius="full"
              variant="bordered"
              onPress={handleGoHome}
              aria-label="Volver al inicio"
              className="border-divider bg-background text-foreground hover:border-primary hover:text-primary shrink-0">
              <LuChevronLeft size={18} />
            </Button>

            <div className="flex items-center gap-1.5 text-xs sm:text-sm min-w-0">
              <button
                type="button"
                onClick={handleGoHome}
                className="text-default-400 hover:text-primary transition-colors shrink-0">
                Cuestionarios
              </button>
              <span className="text-default-400 shrink-0">/</span>
              <span className="font-medium text-foreground truncate">
                {test?.title || "Resultado"}
              </span>
            </div>
          </div>

          <div className="lg:hidden">
            <ThemeButton />
          </div>
        </div>

        {/* Center content */}
        <div className="my-10 lg:my-auto w-full max-w-xl mx-auto flex flex-col items-start gap-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary-700 dark:text-primary-400">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Resultado · {test?.title || "Cuestionario"}
          </span>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.08] text-foreground">
            Acertaste
            <br />
            {correctAnswers} de {totalQuestions}
          </h1>

          <p className="text-sm sm:text-base text-default-500 leading-relaxed max-w-md">
            Tu calificación fue {rating.toFixed(2)} de 5.00.{" "}
            {incorrectCount > 0
              ? `Repasa las ${incorrectCount} que fallaste para entender por qué y `
              : "Excelente trabajo, "}
            <em className="italic">aprende de cada respuesta.</em>
          </p>

          {/* Segmented Accuracy Bar */}
          <div className="w-full flex flex-col gap-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-default-500">Precisión</span>
              <span className="font-bold text-foreground">{accuracy}%</span>
            </div>
            <div className="flex items-center gap-1.5 w-full">
              {allRows.map((row) => (
                <span
                  key={row.id}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    row.isCorrect
                      ? "bg-emerald-600"
                      : "bg-rose-500/20 border border-rose-500/40"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 3 Stat Cards */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="rounded-2xl border border-divider bg-background p-4 flex flex-col gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 text-primary">
                <LuStar size={16} />
              </span>
              <div>
                <p className="text-xl font-bold text-foreground">
                  {computedPoints.toLocaleString("en-US")}
                </p>
                <p className="text-xs text-default-500 mt-0.5">
                  puntos obtenidos
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-divider bg-background p-4 flex flex-col gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 text-primary">
                <LuClock size={16} />
              </span>
              <div>
                <p className="text-xl font-bold text-foreground">
                  {formatDuration(time)}
                </p>
                <p className="text-xs text-default-500 mt-0.5 leading-snug">
                  en total, {avgSeconds} s por pregunta
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-divider bg-background p-4 flex flex-col gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 text-primary">
                <LuFlame size={16} />
              </span>
              <div>
                <p className="text-xl font-bold text-foreground">
                  {maxStreak} {maxStreak === 1 ? "seguida" : "seguidas"}
                </p>
                <p className="text-xs text-default-500 mt-0.5 leading-snug">
                  tu mejor racha de aciertos
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block" />
      </section>

      {/* ════════════════════════ Right Column: Answers & Actions ════════════════════════ */}
      <main className="flex flex-col justify-between px-6 py-7 sm:px-12 sm:py-8 lg:px-14 bg-background">
        {/* Top theme button */}
        <div className="hidden lg:flex justify-end">
          <ThemeButton />
        </div>

        {/* Center content */}
        <div className="my-auto w-full max-w-2xl mx-auto flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Tus respuestas
            </h2>
            <p className="text-xs sm:text-sm text-default-400 mt-0.5">
              Toca una para ver la explicación.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {(
              [
                { key: "all", label: "Todas", count: allRows.length },
                { key: "failed", label: "Falladas", count: incorrectCount },
                { key: "correct", label: "Correctas", count: correctAnswers },
              ] as const
            ).map((tab) => {
              const active = filter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setFilter(tab.key)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : "border-divider bg-content1 text-default-500 hover:border-primary/40"
                  }`}>
                  <span>{tab.label}</span>
                  <span className="opacity-70">{tab.count}</span>
                </button>
              );
            })}
          </div>

          {/* Accordion List */}
          <div className="max-h-[62vh] overflow-y-auto pr-1">
            {filteredRows.length === 0 ? (
              <div className="rounded-xl border border-divider bg-content1 p-6 text-center text-sm text-default-400">
                No hay respuestas en esta categoría.
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {filteredRows.map((row) => {
                  const isExpanded = Boolean(expandedIds[row.id]);
                  return (
                    <li
                      key={row.id}
                      className="rounded-xl border border-divider bg-content1 overflow-hidden transition-colors">
                      <button
                        type="button"
                        onClick={() => toggleExpanded(row.id)}
                        className="w-full flex items-center gap-3 px-3.5 py-3 text-left hover:bg-content2/40 transition-colors">
                        <span
                          className={`flex items-center justify-center w-6 h-6 rounded-md shrink-0 ${
                            row.isCorrect
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                          }`}>
                          {row.isCorrect ? (
                            <LuCheck size={14} />
                          ) : (
                            <LuX size={14} />
                          )}
                        </span>

                        <div className="flex-1 min-w-0 flex items-center gap-2 text-sm">
                          <span className="font-semibold text-foreground shrink-0">
                            Pregunta {row.index}
                          </span>
                          <span className="text-xs text-default-400 truncate">
                            {row.isCorrect
                              ? "Correcta"
                              : row.wasAnswered
                                ? "Incorrecta"
                                : "Sin responder"}
                          </span>
                        </div>

                        <span
                          className={`text-xs font-bold shrink-0 ${
                            row.isCorrect
                              ? "text-foreground"
                              : "text-default-400"
                          }`}>
                          {row.isCorrect ? `+${row.points}` : "0"}
                        </span>

                        <span className="text-default-400 shrink-0">
                          {isExpanded ? (
                            <LuChevronUp size={15} />
                          ) : (
                            <LuChevronDown size={15} />
                          )}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-3.5 pt-2.5 pl-12 border-t border-divider bg-content2/30 flex flex-col gap-1.5 text-xs">
                          <p className="font-medium text-foreground">
                            {row.description}
                          </p>
                          {row.selectedText && (
                            <p className="text-default-500">
                              Tu respuesta:{" "}
                              <span className="font-medium text-foreground">
                                {row.selectedText}
                              </span>
                            </p>
                          )}
                          {!row.isCorrect && row.correctText && (
                            <p className="text-emerald-600 dark:text-emerald-400">
                              Respuesta correcta:{" "}
                              <span className="font-semibold">
                                {row.correctText}
                              </span>
                            </p>
                          )}
                          <p className="text-default-500 leading-relaxed">
                            {row.explanation ||
                              "Esta pregunta no tiene explicación registrada."}
                          </p>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            {incorrectCount > 0 && (
              <Button
                color="primary"
                radius="full"
                startContent={<LuRotateCcw size={15} />}
                onPress={handleReviewFailed}
                className="h-12 w-full sm:w-auto sm:flex-1 font-semibold text-sm text-white shadow-sm">
                Repasar las {incorrectCount} que fallé
              </Button>
            )}

            <Button
              variant="bordered"
              radius="full"
              onPress={handleGoHome}
              className={`h-12 px-8 border-divider bg-content1 font-semibold text-sm text-foreground hover:border-primary ${
                incorrectCount === 0 ? "w-full sm:w-auto sm:flex-1" : ""
              }`}>
              Volver al inicio
            </Button>
          </div>

          <p className="text-center text-xs text-default-400">
            Presentado el {moment(presentedAt).format("D MMM YYYY")} a las{" "}
            {moment(presentedAt).format("HH:mm")}
          </p>
        </div>

        <div className="hidden lg:block" />
      </main>
    </div>
  );
}

export default ResumeComponent;
