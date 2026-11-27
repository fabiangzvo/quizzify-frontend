import { useCallback } from "react";
import { useRouter } from "next/router";
import { Button } from "@heroui/react";
import {
  LuCheckSquare,
  LuChevronLeft,
  LuFileCheck2,
  LuLock,
  LuClock,
  LuShuffle,
  LuStar,
} from "react-icons/lu";

import ThemeButton from "@components/themeButton";
import { TestUnpopulated, TopicItem } from "@/types/Test";

function extractTopicNames(
  topics?: Array<TopicItem>,
  topic?: string,
): string[] {
  if (Array.isArray(topics) && topics.length > 0) {
    return topics
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          return (
            item.name ??
            item.title ??
            item.label ??
            item.description ??
            ""
          ).trim();
        }
        return "";
      })
      .filter(Boolean);
  }

  if (typeof topic === "string" && topic.trim()) {
    return topic
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  return [];
}

interface QuizDescriptionProps extends TestUnpopulated {
  onConfirm: (value: boolean) => void;
  totalQuestions?: number;
  totalPoints?: number;
  totalTimeLimit?: number;
}

const HIGHLIGHTS = [
  {
    icon: LuLock,
    title: "Confirmas cada respuesta antes de avanzar",
    description:
      "Elige una opción y toca «Confirmar respuesta». Después ya no podrás cambiarla.",
  },
  {
    icon: LuShuffle,
    title: "Las opciones cambian de orden",
    description:
      "Cada persona las ve mezcladas, así que lee bien antes de elegir.",
  },
  {
    icon: LuFileCheck2,
    title: "Al final repasas cada respuesta",
    description:
      "Ves la explicación de todas y puedes volver a las que fallaste.",
  },
];

function QuizDescription(props: QuizDescriptionProps) {
  const {
    description,
    questions,
    totalQuestions: totalQuestionsProp,
    title,
    topic,
    topics,
    onConfirm,
    totalPoints: totalPointsProp,
    totalTimeLimit: totalTimeLimitProp,
  } = props;
  const totalQuestions = totalQuestionsProp ?? questions.length;
  const totalPoints = totalPointsProp ?? totalQuestions * 1000;
  const totalTimeLimit = totalTimeLimitProp ?? totalQuestions * 30;
  const router = useRouter();
  const topicNames = extractTopicNames(topics, topic);
  const formattedPoints = totalPoints.toLocaleString("en-US");
  const formattedTime =
    totalTimeLimit >= 60
      ? `${Math.round(totalTimeLimit / 60)} min`
      : `${totalTimeLimit} s`;

  const handleStart = useCallback(() => {
    onConfirm(true);
  }, [onConfirm]);

  const handleBack = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <div
      lang="es"
      className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-background text-foreground">
      {/* ════════════════════════ Left Column: Quiz Info ════════════════════════ */}
      <section className="flex flex-col justify-between px-6 py-7 sm:px-12 sm:py-8 lg:px-14 bg-content2 border-b lg:border-b-0 lg:border-r border-divider">
        {/* Top breadcrumb */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              isIconOnly
              size="sm"
              radius="full"
              variant="bordered"
              onPress={handleBack}
              aria-label="Volver al inicio"
              className="border-divider bg-background text-foreground hover:border-primary hover:text-primary shrink-0">
              <LuChevronLeft size={18} />
            </Button>

            <div className="flex items-center gap-1.5 text-xs sm:text-sm min-w-0">
              <button
                type="button"
                onClick={handleBack}
                className="text-default-400 hover:text-primary transition-colors shrink-0">
                Cuestionarios
              </button>
              <span className="text-default-400 shrink-0">/</span>
              <span className="font-medium text-foreground truncate">
                {title}
              </span>
            </div>
          </div>

          <div className="lg:hidden">
            <ThemeButton />
          </div>
        </div>

        {/* Center content */}
        <div className="my-10 lg:my-auto w-full max-w-xl mx-auto flex flex-col items-start gap-5">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.1] text-foreground">
            {title}
          </h1>

          {description && (
            <p className="text-sm sm:text-base text-default-500 leading-relaxed">
              {description}
            </p>
          )}

          {topicNames.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {topicNames.map((name, idx) => (
                <span
                  key={`${name}-${idx}`}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary-700 dark:text-primary-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {name}
                </span>
              ))}
            </div>
          )}

          {/* 3 Stat Pills */}
          <div className="flex flex-wrap gap-3 pt-2">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-divider bg-background pl-1.5 pr-4 py-1.5 text-sm shadow-sm">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white shrink-0">
                <LuCheckSquare size={15} />
              </span>
              <span className="text-default-500">
                <strong className="font-bold text-foreground">
                  {totalQuestions}
                </strong>{" "}
                {totalQuestions === 1 ? "pregunta" : "preguntas"}
              </span>
            </div>

            <div className="inline-flex items-center gap-2.5 rounded-full border border-divider bg-background pl-1.5 pr-4 py-1.5 text-sm shadow-sm">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white shrink-0">
                <LuStar size={15} />
              </span>
              <span className="text-default-500">
                <strong className="font-bold text-foreground">
                  {formattedPoints}
                </strong>{" "}
                puntos
              </span>
            </div>

            <div className="inline-flex items-center gap-2.5 rounded-full border border-divider bg-background pl-1.5 pr-4 py-1.5 text-sm shadow-sm">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white shrink-0">
                <LuClock size={15} />
              </span>
              <span className="text-default-500">
                <strong className="font-bold text-foreground">
                  {formattedTime}
                </strong>{" "}
                de tiempo límite
              </span>
            </div>
          </div>
        </div>

        <div className="hidden lg:block" />
      </section>

      {/* ════════════════════════ Right Column: Rules & CTAs ════════════════════════ */}
      <main className="flex flex-col justify-between px-6 py-7 sm:px-12 sm:py-8 lg:px-14 bg-content1">
        {/* Top theme button */}
        <div className="hidden lg:flex justify-end">
          <ThemeButton />
        </div>

        {/* Center content */}
        <div className="my-auto w-full max-w-lg mx-auto flex flex-col gap-5">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Antes de empezar
            </h2>
            <p className="text-xs sm:text-sm text-default-400 mt-1">
              Así funciona este cuestionario.
            </p>
          </div>

          <ul className="flex flex-col gap-3">
            {HIGHLIGHTS.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.title}
                  className="flex items-start gap-3.5 rounded-2xl border border-divider bg-content1 p-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 text-primary shrink-0 mt-0.5">
                    <Icon size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {item.title}
                    </p>
                    <p className="text-xs text-default-500 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Button
              color="primary"
              radius="full"
              onPress={handleStart}
              className="h-12 w-full sm:w-auto sm:flex-1 font-semibold text-sm text-white shadow-sm">
              Empezar cuestionario
            </Button>

            <Button
              variant="bordered"
              radius="full"
              onPress={handleBack}
              className="h-12 px-8 border-divider bg-content1 font-semibold text-sm text-foreground hover:border-primary">
              Volver
            </Button>
          </div>

          <p className="text-center text-xs text-default-400">
            Necesitas conexión a internet mientras respondes.
          </p>
        </div>

        <div className="hidden lg:block" />
      </main>
    </div>
  );
}

export default QuizDescription;
