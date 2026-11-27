import { useReducer, useContext, useEffect, useRef } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import {
  useForm,
  useFieldArray,
  useWatch,
  Controller,
  FieldErrors,
  SubmitHandler,
} from "react-hook-form";
import {
  Button,
  Checkbox,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import {
  LuCheck,
  LuChevronLeft,
  LuPlus,
  LuSparkles,
  LuTrash2,
  LuX,
} from "react-icons/lu";

import ThemeButton from "@components/themeButton";
import { AuthContext } from "@context/AuthContext";
import { createTest, getTestById, updateTest } from "@api/test";
import { getQuestionById } from "@api/question";
import {
  CreateTestOptionPayload,
  CreateTestPayload,
  CreateTestQuestionPayload,
  UpdateTestOptionPayload,
  UpdateTestPayload,
  UpdateTestQuestionPayload,
} from "@/types/Test";
import { Question } from "@/types/Question";

type QuestionType = "multiple" | "true_false";
type Difficulty = "easy" | "medium" | "hard";

interface QuizOption {
  id: string;
  persistedId?: string;
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: string;
  persistedId?: string;
  type: QuestionType;
  prompt: string;
  options: QuizOption[];
  explanation: string;
  timeLimit: string;
  points: string;
  difficulty: Difficulty;
  shuffleOptions: boolean;
}

interface QuizFormValues {
  title: string;
  description: string;
  tags: string[];
  questions: QuizQuestion[];
}

/* ─── UI State Reducer ─── */
interface PublishMessage {
  type: "success" | "error";
  text: string;
}

interface BuilderUIState {
  activeIndex: number;
  saveState: "saved" | "saving";
  isLoadingQuiz: boolean;
  isPublishing: boolean;
  isAddingTag: boolean;
  newTagText: string;
  aiFeedback: string;
  publishMessage: PublishMessage | null;
}

type BuilderUIAction =
  | { type: "SET_ACTIVE_INDEX"; payload: number }
  | { type: "SET_SAVE_STATE"; payload: "saved" | "saving" }
  | { type: "SET_LOADING_QUIZ"; payload: boolean }
  | { type: "SET_PUBLISHING"; payload: boolean }
  | { type: "OPEN_ADD_TAG" }
  | { type: "CLOSE_ADD_TAG" }
  | { type: "SET_NEW_TAG_TEXT"; payload: string }
  | { type: "SET_AI_FEEDBACK"; payload: string }
  | { type: "SET_PUBLISH_MESSAGE"; payload: PublishMessage | null };

function builderUIReducer(
  state: BuilderUIState,
  action: BuilderUIAction,
): BuilderUIState {
  switch (action.type) {
    case "SET_ACTIVE_INDEX":
      return { ...state, activeIndex: action.payload, aiFeedback: "" };
    case "SET_SAVE_STATE":
      return {
        ...state,
        saveState: action.payload,
        publishMessage:
          action.payload === "saving" ? null : state.publishMessage,
      };
    case "SET_LOADING_QUIZ":
      return { ...state, isLoadingQuiz: action.payload };
    case "SET_PUBLISHING":
      return { ...state, isPublishing: action.payload };
    case "OPEN_ADD_TAG":
      return { ...state, isAddingTag: true };
    case "CLOSE_ADD_TAG":
      return { ...state, isAddingTag: false, newTagText: "" };
    case "SET_NEW_TAG_TEXT":
      return { ...state, newTagText: action.payload };
    case "SET_AI_FEEDBACK":
      return { ...state, aiFeedback: action.payload };
    case "SET_PUBLISH_MESSAGE":
      return { ...state, publishMessage: action.payload };
    default:
      return state;
  }
}

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  multiple: "Opción múltiple",
  true_false: "Verdadero / falso",
};

const TIME_LIMIT_OPTIONS = [
  { key: "15", label: "15 segundos" },
  { key: "20", label: "20 segundos" },
  { key: "30", label: "30 segundos" },
  { key: "45", label: "45 segundos" },
  { key: "60", label: "60 segundos" },
  { key: "120", label: "2 minutos" },
  { key: "0", label: "Sin límite" },
];

const POINTS_OPTIONS = [
  { key: "1000", label: "Normal · 1,000" },
  { key: "1500", label: "Medio · 1,500" },
  { key: "2000", label: "Doble · 2,000" },
  { key: "0", label: "Sin puntos · 0" },
];

const DIFFICULTY_OPTIONS: { key: Difficulty; label: string }[] = [
  { key: "easy", label: "Fácil" },
  { key: "medium", label: "Media" },
  { key: "hard", label: "Difícil" },
];

const OPTION_BADGE_STYLES = [
  "bg-primary text-white",
  "bg-emerald-600 text-white",
  "bg-amber-500 text-white",
  "bg-rose-500 text-white",
  "bg-indigo-500 text-white",
  "bg-cyan-600 text-white",
];

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];
const MAX_PROMPT_LENGTH = 160;

function createEmptyQuestion(
  index: number,
  type: QuestionType = "multiple",
): QuizQuestion {
  const baseId = `q-${Date.now()}-${index}`;

  const options: QuizOption[] =
    type === "true_false"
      ? [
          { id: `${baseId}-opt-1`, text: "Verdadero", isCorrect: true },
          { id: `${baseId}-opt-2`, text: "Falso", isCorrect: false },
        ]
      : [
          { id: `${baseId}-opt-1`, text: "", isCorrect: false },
          { id: `${baseId}-opt-2`, text: "", isCorrect: true },
          { id: `${baseId}-opt-3`, text: "", isCorrect: false },
          { id: `${baseId}-opt-4`, text: "", isCorrect: false },
        ];

  return {
    id: baseId,
    type,
    prompt: "",
    options,
    explanation: "",
    timeLimit: "30",
    points: "1000",
    difficulty: "medium",
    shuffleOptions: true,
  };
}

function mapApiQuestionToForm(q: Question, idx: number): QuizQuestion {
  const options: QuizOption[] = (q.options ?? []).map((opt, optIdx) => ({
    id: opt._id ?? `q-${idx}-opt-${optIdx}`,
    persistedId: opt._id,
    text: opt.description ?? "",
    isCorrect: Boolean(opt.isCorrect),
  }));

  const isTrueFalse =
    options.length === 2 &&
    options.some((o) => o.text.trim().toLowerCase() === "verdadero") &&
    options.some((o) => o.text.trim().toLowerCase() === "falso");

  return {
    id: q._id ?? `q-${idx}`,
    persistedId: q._id,
    type: isTrueFalse ? "true_false" : "multiple",
    prompt: q.description ?? "",
    options: options.length >= 2 ? options : createEmptyQuestion(idx).options,
    explanation: q.explanation ?? "",
    timeLimit: String(q.timeLimit ?? 30),
    points: String(q.points ?? 1000),
    difficulty: q.difficulty ?? "medium",
    shuffleOptions: q.shuffleOptions ?? true,
  };
}

type SnapshotOption = CreateTestOptionPayload & { _id?: string };

type SnapshotQuestion = Omit<CreateTestQuestionPayload, "options"> & {
  _id?: string;
  options: Array<SnapshotOption>;
};

interface FullUpdateSnapshot {
  title: string;
  topics: Array<string>;
  description: string;
  questions: Array<SnapshotQuestion>;
}

function buildTestPayload(data: QuizFormValues): CreateTestPayload {
  return {
    title: data.title.trim(),
    topics: data.tags.map((t) => t.trim()).filter(Boolean),
    description: data.description.trim(),
    questions: data.questions.map((q) => ({
      description: q.prompt.trim(),
      explanation: q.explanation.trim(),
      timeLimit: Number(q.timeLimit),
      points: Number(q.points),
      difficulty: q.difficulty,
      shuffleOptions: q.shuffleOptions,
      options: q.options.map((opt) => ({
        description: opt.text.trim(),
        isCorrect: opt.isCorrect,
      })),
    })),
  };
}

function buildUpdateSnapshot(data: QuizFormValues): FullUpdateSnapshot {
  return {
    title: data.title.trim(),
    topics: data.tags.map((t) => t.trim()).filter(Boolean),
    description: data.description.trim(),
    questions: data.questions.map((q) => ({
      ...(q.persistedId ? { _id: q.persistedId } : {}),
      description: q.prompt.trim(),
      explanation: q.explanation.trim(),
      timeLimit: Number(q.timeLimit),
      points: Number(q.points),
      difficulty: q.difficulty,
      shuffleOptions: q.shuffleOptions,
      options: q.options.map((opt) => ({
        ...(opt.persistedId ? { _id: opt.persistedId } : {}),
        description: opt.text.trim(),
        isCorrect: opt.isCorrect,
      })),
    })),
  };
}

function getModifiedOptions(
  initialOptions: Array<SnapshotOption>,
  currentOptions: Array<SnapshotOption>,
): Array<UpdateTestOptionPayload> {
  const initialMap = new Map(
    initialOptions
      .filter((o): o is SnapshotOption & { _id: string } => Boolean(o._id))
      .map((o) => [o._id, o]),
  );

  const modified: Array<UpdateTestOptionPayload> = [];

  for (const opt of currentOptions) {
    if (!opt._id) {
      modified.push(opt);
      continue;
    }

    const prev = initialMap.get(opt._id);
    if (!prev) {
      modified.push(opt);
      continue;
    }

    const optDiff: UpdateTestOptionPayload = { _id: opt._id };
    let hasChanges = false;

    if (opt.description !== prev.description) {
      optDiff.description = opt.description;
      hasChanges = true;
    }
    if (opt.isCorrect !== prev.isCorrect) {
      optDiff.isCorrect = opt.isCorrect;
      hasChanges = true;
    }

    if (hasChanges) {
      modified.push(optDiff);
    }
  }

  return modified;
}

function getModifiedPayload(
  initial: FullUpdateSnapshot,
  current: FullUpdateSnapshot,
): UpdateTestPayload {
  const diff: UpdateTestPayload = {};

  if (current.title !== initial.title) {
    diff.title = current.title;
  }
  if (JSON.stringify(current.topics) !== JSON.stringify(initial.topics)) {
    diff.topics = current.topics;
  }
  if (current.description !== initial.description) {
    diff.description = current.description;
  }

  const initialQuestionsMap = new Map(
    initial.questions
      .filter((q): q is SnapshotQuestion & { _id: string } => Boolean(q._id))
      .map((q) => [q._id, q]),
  );

  const modifiedQuestions: Array<UpdateTestQuestionPayload> = [];

  for (const q of current.questions) {
    if (!q._id) {
      modifiedQuestions.push(q);
      continue;
    }

    const prev = initialQuestionsMap.get(q._id);
    if (!prev) {
      modifiedQuestions.push(q);
      continue;
    }

    const qDiff: UpdateTestQuestionPayload = { _id: q._id };
    let hasChanges = false;

    if (q.description !== prev.description) {
      qDiff.description = q.description;
      hasChanges = true;
    }
    if (q.explanation !== prev.explanation) {
      qDiff.explanation = q.explanation;
      hasChanges = true;
    }
    if (q.timeLimit !== prev.timeLimit) {
      qDiff.timeLimit = q.timeLimit;
      hasChanges = true;
    }
    if (q.points !== prev.points) {
      qDiff.points = q.points;
      hasChanges = true;
    }
    if (q.difficulty !== prev.difficulty) {
      qDiff.difficulty = q.difficulty;
      hasChanges = true;
    }
    if (q.shuffleOptions !== prev.shuffleOptions) {
      qDiff.shuffleOptions = q.shuffleOptions;
      hasChanges = true;
    }

    const modifiedOptions = getModifiedOptions(prev.options, q.options);
    if (modifiedOptions.length > 0) {
      qDiff.options = modifiedOptions;
      hasChanges = true;
    }

    if (hasChanges) {
      modifiedQuestions.push(qDiff);
    }
  }

  if (modifiedQuestions.length > 0) {
    diff.questions = modifiedQuestions;
  }

  return diff;
}

interface QuizBuilderProps {
  testId?: string;
}

export default function QuizBuilder({ testId }: QuizBuilderProps) {
  const isEditMode = Boolean(testId);
  const router = useRouter();
  const { refreshAuthContext, isAuthenticated } = useContext(AuthContext);

  const [uiState, dispatch] = useReducer(builderUIReducer, {
    activeIndex: 0,
    saveState: "saved",
    isLoadingQuiz: Boolean(testId),
    isPublishing: false,
    isAddingTag: false,
    newTagText: "",
    aiFeedback: "",
    publishMessage: null,
  });

  const saveTimerRef = useRef<number | null>(null);
  const initialPayloadRef = useRef<FullUpdateSnapshot | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<QuizFormValues>({
    mode: "onTouched",
    defaultValues: {
      title: "",
      description: "",
      tags: [],
      questions: [createEmptyQuestion(1)],
    },
  });

  const {
    fields: questionFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "questions",
    keyName: "fieldKey",
  });

  const watchedTitle = useWatch({ control, name: "title" });
  const watchedTags = useWatch({ control, name: "tags" });
  const watchedQuestions = useWatch({ control, name: "questions" });

  const {
    isOpen: isPreviewOpen,
    onOpen: onPreviewOpen,
    onOpenChange: onPreviewOpenChange,
  } = useDisclosure();

  useEffect(() => {
    refreshAuthContext();
    const hasToken = !!window.localStorage.getItem("token");
    if (!hasToken) {
      router.push("/auth/signIn");
    }
  }, [router, refreshAuthContext]);

  useEffect(() => {
    if (!testId || !isAuthenticated) return;

    let cancelled = false;

    async function loadQuiz() {
      dispatch({ type: "SET_LOADING_QUIZ", payload: true });
      try {
        const testInfo = await getTestById({ testId: testId as string });
        const rawQuestions = testInfo.questions ?? [];

        const loadedQuestions: Question[] = await Promise.all(
          rawQuestions.map((item) =>
            typeof item === "string"
              ? getQuestionById({ questionId: item })
              : Promise.resolve(item as unknown as Question),
          ),
        );

        if (cancelled) return;

        const parsedTags = Array.isArray(testInfo.topics)
          ? testInfo.topics
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
              .filter(Boolean)
          : testInfo.topic
            ? testInfo.topic
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : [];

        const mappedQuestions =
          loadedQuestions.length > 0
            ? loadedQuestions.map((q, idx) => mapApiQuestionToForm(q, idx))
            : [createEmptyQuestion(1)];

        const initialValues: QuizFormValues = {
          title: testInfo.title ?? "",
          description: testInfo.description ?? "",
          tags: parsedTags,
          questions: mappedQuestions,
        };

        initialPayloadRef.current = buildUpdateSnapshot(initialValues);
        reset(initialValues);
        dispatch({ type: "SET_ACTIVE_INDEX", payload: 0 });
      } catch {
        if (!cancelled) {
          dispatch({
            type: "SET_PUBLISH_MESSAGE",
            payload: {
              type: "error",
              text: "No se pudo cargar el cuestionario para editar.",
            },
          });
        }
      } finally {
        if (!cancelled) {
          dispatch({ type: "SET_LOADING_QUIZ", payload: false });
        }
      }
    }

    loadQuiz();

    return () => {
      cancelled = true;
    };
  }, [testId, isAuthenticated, reset]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const activeIndex = Math.min(
    uiState.activeIndex,
    Math.max(0, questionFields.length - 1),
  );
  const currentQuestion =
    watchedQuestions?.[activeIndex] ?? questionFields[activeIndex];
  const activeFieldKey = questionFields[activeIndex]?.fieldKey ?? "default";

  const markDirty = () => {
    dispatch({ type: "SET_SAVE_STATE", payload: "saving" });
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = window.setTimeout(() => {
      dispatch({ type: "SET_SAVE_STATE", payload: "saved" });
    }, 450);
  };

  const setQuestionField = <K extends keyof QuizQuestion>(
    field: K,
    value: QuizQuestion[K],
  ) => {
    setValue(`questions.${activeIndex}.${field}` as const, value as never, {
      shouldDirty: true,
      shouldValidate: true,
    });
    markDirty();
  };

  const handleTypeChange = (type: QuestionType) => {
    const q = getValues(`questions.${activeIndex}`);
    if (!q || q.type === type) return;

    let nextOptions = q.options;
    if (type === "true_false") {
      nextOptions = [
        { id: `${q.id}-tf-1`, text: "Verdadero", isCorrect: true },
        { id: `${q.id}-tf-2`, text: "Falso", isCorrect: false },
      ];
    } else if (type === "multiple" && q.type === "true_false") {
      nextOptions = [
        { id: `${q.id}-opt-1`, text: "", isCorrect: false },
        { id: `${q.id}-opt-2`, text: "", isCorrect: true },
        { id: `${q.id}-opt-3`, text: "", isCorrect: false },
        { id: `${q.id}-opt-4`, text: "", isCorrect: false },
      ];
    }

    setQuestionField("type", type);
    setQuestionField("options", nextOptions);
  };

  const handleOptionTextChange = (optionId: string, text: string) => {
    const options = getValues(`questions.${activeIndex}.options`);
    setQuestionField(
      "options",
      options.map((opt) => (opt.id === optionId ? { ...opt, text } : opt)),
    );
  };

  const handleMarkCorrect = (optionId: string) => {
    const options = getValues(`questions.${activeIndex}.options`);
    setQuestionField(
      "options",
      options.map((opt) => ({
        ...opt,
        isCorrect: opt.id === optionId,
      })),
    );
  };

  const handleDeleteOption = (optionId: string) => {
    const options = getValues(`questions.${activeIndex}.options`);
    if (options.length <= 2) return;
    const filtered = options.filter((opt) => opt.id !== optionId);
    if (!filtered.some((opt) => opt.isCorrect) && filtered.length > 0) {
      filtered[0] = { ...filtered[0], isCorrect: true };
    }
    setQuestionField("options", filtered);
  };

  const handleAddOption = () => {
    const q = getValues(`questions.${activeIndex}`);
    if (!q || q.options.length >= OPTION_LETTERS.length) return;
    setQuestionField("options", [
      ...q.options,
      {
        id: `${q.id}-opt-${Date.now()}`,
        text: "",
        isCorrect: false,
      },
    ]);
  };

  const handleAddQuestion = () => {
    const newQ = createEmptyQuestion(questionFields.length + 1);
    append(newQ);
    dispatch({ type: "SET_ACTIVE_INDEX", payload: questionFields.length });
    markDirty();
  };

  const handleDeleteQuestion = (idx: number) => {
    if (questionFields.length <= 1) return;
    remove(idx);
    const nextIdx =
      idx < activeIndex
        ? activeIndex - 1
        : idx === activeIndex
          ? Math.max(0, activeIndex - 1)
          : activeIndex;
    dispatch({ type: "SET_ACTIVE_INDEX", payload: nextIdx });
    markDirty();
  };

  const handleAddTag = () => {
    const trimmed = uiState.newTagText.trim();
    if (!trimmed) {
      dispatch({ type: "CLOSE_ADD_TAG" });
      return;
    }
    const currentTags = getValues("tags") ?? [];
    if (!currentTags.includes(trimmed)) {
      setValue("tags", [...currentTags, trimmed], { shouldDirty: true });
      markDirty();
    }
    dispatch({ type: "CLOSE_ADD_TAG" });
  };

  const handleRemoveTag = (tag: string) => {
    const currentTags = getValues("tags") ?? [];
    setValue(
      "tags",
      currentTags.filter((t) => t !== tag),
      { shouldDirty: true },
    );
    markDirty();
  };

  const handleSuggestDistractors = () => {
    const q = getValues(`questions.${activeIndex}`);
    if (q.type !== "multiple") {
      dispatch({
        type: "SET_AI_FEEDBACK",
        payload: "Cambia a Opción múltiple para sugerir distractores.",
      });
      return;
    }
    const placeholders = [
      "Solicitar aprobación antes de continuar",
      "Posponer la decisión hasta el próximo trimestre",
      "Enviar documentación técnica sin contexto",
      "Derivar el caso directamente a soporte",
    ];
    let pIdx = 0;
    setQuestionField(
      "options",
      q.options.map((opt) => {
        if (opt.isCorrect || opt.text.trim()) return opt;
        const suggestion = placeholders[pIdx % placeholders.length];
        pIdx += 1;
        return { ...opt, text: suggestion };
      }),
    );
    dispatch({
      type: "SET_AI_FEEDBACK",
      payload: "Distractores sugeridos en las opciones vacías.",
    });
  };

  const handleImproveWording = () => {
    const prompt = getValues(`questions.${activeIndex}.prompt`) ?? "";
    if (!prompt.trim()) {
      dispatch({
        type: "SET_AI_FEEDBACK",
        payload: "Escribe primero una pregunta para mejorar su redacción.",
      });
      return;
    }
    const cleaned = prompt.trim();
    const formatted =
      cleaned.endsWith("?") || cleaned.endsWith(".") ? cleaned : `${cleaned}?`;
    setQuestionField("prompt", formatted);
    dispatch({
      type: "SET_AI_FEEDBACK",
      payload: "Redacción revisada.",
    });
  };

  const onPublish: SubmitHandler<QuizFormValues> = async (data) => {
    const invalidOptionIdx = data.questions.findIndex(
      (q) =>
        q.options.some((o) => !o.text.trim()) ||
        !q.options.some((o) => o.isCorrect),
    );

    if (invalidOptionIdx !== -1) {
      dispatch({ type: "SET_ACTIVE_INDEX", payload: invalidOptionIdx });
      dispatch({
        type: "SET_PUBLISH_MESSAGE",
        payload: {
          type: "error",
          text: `Completa todas las respuestas y marca la correcta en la pregunta ${invalidOptionIdx + 1}.`,
        },
      });
      return;
    }

    if (data.tags.length === 0) {
      dispatch({
        type: "SET_PUBLISH_MESSAGE",
        payload: {
          type: "error",
          text: "Agrega al menos una etiqueta al cuestionario antes de publicar.",
        },
      });
      return;
    }

    let updatePayload: UpdateTestPayload | null = null;
    if (isEditMode && testId) {
      const updateSnapshot = buildUpdateSnapshot(data);
      updatePayload = initialPayloadRef.current
        ? getModifiedPayload(initialPayloadRef.current, updateSnapshot)
        : updateSnapshot;

      if (Object.keys(updatePayload).length === 0) {
        dispatch({
          type: "SET_PUBLISH_MESSAGE",
          payload: {
            type: "success",
            text: "No hay cambios nuevos para guardar.",
          },
        });
        return;
      }
    }

    const payload = buildTestPayload(data);

    dispatch({ type: "SET_PUBLISHING", payload: true });
    dispatch({ type: "SET_PUBLISH_MESSAGE", payload: null });

    try {
      const response =
        isEditMode && testId && updatePayload
          ? await updateTest(testId, updatePayload)
          : await createTest(payload);

      if (response?.status === 200 || response?.status === 201) {
        dispatch({
          type: "SET_PUBLISH_MESSAGE",
          payload: {
            type: "success",
            text: isEditMode
              ? `Cuestionario "${payload.title}" actualizado correctamente.`
              : `Cuestionario "${payload.title}" publicado correctamente.`,
          },
        });
        router.push("/");
      } else {
        dispatch({
          type: "SET_PUBLISH_MESSAGE",
          payload: {
            type: "error",
            text: isEditMode
              ? "No se pudo actualizar el cuestionario. Inténtalo nuevamente."
              : "No se pudo publicar el cuestionario. Inténtalo nuevamente.",
          },
        });
      }
    } catch {
      dispatch({
        type: "SET_PUBLISH_MESSAGE",
        payload: {
          type: "error",
          text: isEditMode
            ? "No se pudo actualizar el cuestionario. Inténtalo nuevamente."
            : "No se pudo publicar el cuestionario. Inténtalo nuevamente.",
        },
      });
    } finally {
      dispatch({ type: "SET_PUBLISHING", payload: false });
    }
  };

  const onPublishInvalid = (formErrors: FieldErrors<QuizFormValues>) => {
    if (formErrors.title) {
      dispatch({
        type: "SET_PUBLISH_MESSAGE",
        payload: {
          type: "error",
          text:
            formErrors.title.message ||
            "Agrega un título al cuestionario antes de publicar.",
        },
      });
      return;
    }

    const firstInvalidIdx = Array.isArray(formErrors.questions)
      ? formErrors.questions.findIndex(Boolean)
      : -1;

    if (firstInvalidIdx !== -1) {
      dispatch({ type: "SET_ACTIVE_INDEX", payload: firstInvalidIdx });
      dispatch({
        type: "SET_PUBLISH_MESSAGE",
        payload: {
          type: "error",
          text: `Revisa los campos requeridos en la pregunta ${firstInvalidIdx + 1}.`,
        },
      });
    }
  };

  if (!isAuthenticated) return null;

  if (uiState.isLoadingQuiz) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background text-foreground">
        <Spinner color="primary" size="lg" />
        <p className="text-sm text-default-500">Cargando cuestionario...</p>
      </div>
    );
  }

  const activePromptError = errors.questions?.[activeIndex]?.prompt?.message;
  const pageTitle = isEditMode
    ? `Editar: ${watchedTitle || "cuestionario"}`
    : watchedTitle || "Nuevo cuestionario";

  return (
    <>
      <Head>
        <title>{pageTitle} | Quizzify</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/lightBrain.svg" sizes="any" />
      </Head>

      <form
        lang="es"
        onSubmit={handleSubmit(onPublish, onPublishInvalid)}
        noValidate
        className="min-h-screen flex flex-col bg-background text-foreground">
        {/* ════════════════════════ Top Bar ════════════════════════ */}
        <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-divider bg-content1/90 backdrop-blur-lg px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              as={NextLink}
              href="/"
              isIconOnly
              size="sm"
              radius="full"
              variant="bordered"
              aria-label="Volver al inicio"
              className="border-divider bg-content1 text-foreground hover:border-primary hover:text-primary shrink-0">
              <LuChevronLeft size={18} />
            </Button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-default-500">
                <NextLink href="/" className="hover:text-primary">
                  Mis cuestionarios
                </NextLink>
                <span>/</span>
                <span className="truncate font-medium text-default-600 max-w-[200px] sm:max-w-xs">
                  {watchedTitle ||
                    (isEditMode ? "Editar cuestionario" : "Nuevo cuestionario")}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                Pregunta {activeIndex + 1} de {questionFields.length}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <LuCheck size={14} />
              {uiState.saveState === "saving"
                ? "Guardando..."
                : "Cambios guardados"}
            </span>

            <ThemeButton />

            <Button
              type="button"
              variant="bordered"
              radius="full"
              size="sm"
              onPress={onPreviewOpen}
              className="border-primary/40 text-primary font-semibold px-4 h-9">
              Vista previa
            </Button>

            <Button
              type="submit"
              color="primary"
              radius="full"
              size="sm"
              isLoading={uiState.isPublishing}
              isDisabled={uiState.isPublishing}
              className="font-semibold text-white px-5 h-9 shadow-sm">
              {isEditMode ? "Guardar cambios" : "Publicar cuestionario"}
            </Button>
          </div>
        </header>

        {uiState.publishMessage && (
          <div
            role="status"
            className={`px-6 py-2.5 text-sm font-medium border-b flex items-center justify-between ${
              uiState.publishMessage.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                : "bg-danger-50 border-danger-200 text-danger-600 dark:text-danger-400"
            }`}>
            <span>{uiState.publishMessage.text}</span>
            <button
              type="button"
              onClick={() =>
                dispatch({ type: "SET_PUBLISH_MESSAGE", payload: null })
              }
              aria-label="Cerrar aviso"
              className="p-1 hover:opacity-70">
              <LuX size={16} />
            </button>
          </div>
        )}

        {/* ════════════════════════ 3-Column Builder ════════════════════════ */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[240px_1fr_290px] gap-6 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6">
          {/* ── Left Column: Questions List ── */}
          <aside className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold text-default-500 px-1">
              Preguntas
            </h2>

            <div className="flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
              {questionFields.map((field, idx) => {
                const q = watchedQuestions?.[idx] ?? field;
                const isActive = idx === activeIndex;
                return (
                  <div
                    key={field.fieldKey}
                    className={`group relative shrink-0 w-52 lg:w-full rounded-xl border p-3 text-left transition-all cursor-pointer ${
                      isActive
                        ? "border-primary bg-content1 ring-2 ring-primary/15 shadow-sm"
                        : "border-divider bg-content1 hover:border-primary/40"
                    }`}
                    onClick={() =>
                      dispatch({ type: "SET_ACTIVE_INDEX", payload: idx })
                    }>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={`text-[11px] font-medium ${
                          isActive ? "text-primary" : "text-default-400"
                        }`}>
                        {idx + 1} · {QUESTION_TYPE_LABELS[q.type]}
                      </span>
                      {questionFields.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuestion(idx);
                          }}
                          aria-label={`Eliminar pregunta ${idx + 1}`}
                          className="opacity-0 group-hover:opacity-100 text-default-400 hover:text-danger transition-opacity">
                          <LuTrash2 size={13} />
                        </button>
                      )}
                    </div>
                    <p className="text-xs font-medium text-foreground line-clamp-2 min-h-[2rem]">
                      {q.prompt?.trim() || "Pregunta sin título..."}
                    </p>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={handleAddQuestion}
                className="shrink-0 w-44 lg:w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10 py-3 px-4 text-xs font-semibold text-primary transition-colors">
                <LuPlus size={14} />
                Agregar pregunta
              </button>
            </div>
          </aside>

          {/* ── Center Column: Quiz Info + Question Editor ── */}
          <main className="min-w-0 flex flex-col gap-5">
            <div className="rounded-2xl border border-divider bg-content1 p-5 sm:px-7 sm:py-5 shadow-sm flex flex-col gap-4">
              <Controller
                name="title"
                control={control}
                rules={{
                  required: "Ingresa un título para el cuestionario.",
                }}
                render={({ field }) => (
                  <Input
                    id="quiz-title"
                    label="Título del cuestionario"
                    labelPlacement="outside"
                    placeholder="Ej. Fundamentos de JavaScript"
                    variant="bordered"
                    radius="lg"
                    isRequired
                    value={field.value ?? ""}
                    onValueChange={(val) => {
                      field.onChange(val);
                      markDirty();
                    }}
                    onBlur={field.onBlur}
                    isInvalid={!!errors.title}
                    errorMessage={errors.title?.message}
                    classNames={{
                      label: "text-xs font-medium text-default-500 pb-1.5",
                      inputWrapper:
                        "h-12 bg-content1 border-divider shadow-none data-[hover=true]:border-primary-300 group-data-[focus=true]:border-primary",
                      input: "text-base font-semibold text-foreground",
                      errorMessage: "text-xs font-medium text-danger pt-1",
                    }}
                  />
                )}
              />

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="quiz-description"
                    label="Descripción del cuestionario"
                    labelPlacement="outside"
                    placeholder="Describe brevemente de qué trata este cuestionario (opcional)..."
                    variant="bordered"
                    radius="lg"
                    minRows={2}
                    value={field.value ?? ""}
                    onValueChange={(val) => {
                      field.onChange(val);
                      markDirty();
                    }}
                    onBlur={field.onBlur}
                    classNames={{
                      label: "text-xs font-medium text-default-500 pb-1.5",
                      inputWrapper:
                        "bg-content1 border-divider shadow-none data-[hover=true]:border-primary-300 group-data-[focus=true]:border-primary",
                      input: "text-sm text-foreground",
                    }}
                  />
                )}
              />

              {/* Quiz Tags */}
              <div>
                <p className="text-xs font-medium text-default-500 mb-2">
                  Etiquetas
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(watchedTags ?? []).map((tag) => (
                    <Chip
                      key={tag}
                      size="sm"
                      variant="bordered"
                      onClose={() => handleRemoveTag(tag)}
                      classNames={{
                        base: "border-divider bg-content2/50",
                        content: "text-xs text-foreground",
                      }}>
                      {tag}
                    </Chip>
                  ))}

                  {uiState.isAddingTag ? (
                    <input
                      autoFocus
                      value={uiState.newTagText}
                      placeholder="Etiqueta..."
                      onChange={(e) =>
                        dispatch({
                          type: "SET_NEW_TAG_TEXT",
                          payload: e.target.value,
                        })
                      }
                      onBlur={handleAddTag}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        } else if (e.key === "Escape") {
                          dispatch({ type: "CLOSE_ADD_TAG" });
                        }
                      }}
                      className="h-6 w-28 rounded-full border border-primary bg-content1 px-2.5 text-xs text-foreground focus:outline-none"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "OPEN_ADD_TAG" })}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-primary hover:underline">
                      <LuPlus size={12} />
                      Agregar etiqueta
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-divider bg-content1 p-5 sm:p-7 shadow-sm flex flex-col gap-6">
              {/* Question Type */}
              <div>
                <p className="text-xs font-medium text-default-500 mb-2.5">
                  Tipo de pregunta
                </p>
                <div className="flex flex-wrap gap-2">
                  {(["multiple", "true_false"] as QuestionType[]).map((type) => {
                    const selected = currentQuestion.type === type;
                    return (
                      <Button
                        key={type}
                        type="button"
                        size="sm"
                        radius="full"
                        variant={selected ? "solid" : "bordered"}
                        color={selected ? "primary" : "default"}
                        onPress={() => handleTypeChange(type)}
                        className={`font-medium px-4 h-9 ${
                          selected
                            ? "text-white"
                            : "border-divider bg-content1 text-default-600 hover:border-primary/50"
                        }`}>
                        {QUESTION_TYPE_LABELS[type]}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Prompt */}
              <div>
                <label
                  htmlFor="question-prompt"
                  className="block text-xs font-medium text-default-500 mb-2">
                  Pregunta
                </label>
                <Controller
                  key={`prompt-${activeFieldKey}`}
                  name={`questions.${activeIndex}.prompt`}
                  control={control}
                  rules={{
                    required: "Escribe el enunciado de la pregunta.",
                    maxLength: {
                      value: MAX_PROMPT_LENGTH,
                      message: `Máximo ${MAX_PROMPT_LENGTH} caracteres.`,
                    },
                  }}
                  render={({ field }) => (
                    <Textarea
                      id="question-prompt"
                      placeholder="Escribe tu pregunta aquí..."
                      variant="bordered"
                      radius="lg"
                      minRows={3}
                      maxLength={MAX_PROMPT_LENGTH}
                      value={field.value ?? ""}
                      onValueChange={(val) => {
                        field.onChange(val);
                        markDirty();
                      }}
                      onBlur={field.onBlur}
                      isInvalid={!!activePromptError}
                      errorMessage={activePromptError}
                      classNames={{
                        inputWrapper:
                          "bg-content1 border-divider shadow-none data-[hover=true]:border-primary-300 group-data-[focus=true]:border-primary",
                        input: "text-base font-medium text-foreground",
                      }}
                    />
                  )}
                />
                <p className="mt-1.5 text-right text-[11px] text-default-400">
                  {(currentQuestion.prompt ?? "").length} / {MAX_PROMPT_LENGTH}{" "}
                  caracteres
                </p>
              </div>

              {/* Answers Section */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-medium text-default-500">
                    Respuestas
                  </span>
                  <span className="text-[11px] text-default-400">
                    Marca la respuesta correcta
                  </span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {currentQuestion.options.map((opt, idx) => {
                    const letter = OPTION_LETTERS[idx] ?? String(idx + 1);
                    const badgeColor =
                      OPTION_BADGE_STYLES[idx % OPTION_BADGE_STYLES.length];
                    const isTrueFalse = currentQuestion.type === "true_false";

                    return (
                      <div
                        key={opt.id}
                        className={`flex items-center gap-3 rounded-xl border px-3 py-2 transition-colors ${
                          opt.isCorrect
                            ? "border-emerald-600 bg-emerald-500/5"
                            : "border-divider bg-content1"
                        }`}>
                        <span
                          className={`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold shrink-0 ${
                            opt.isCorrect
                              ? "bg-emerald-600 text-white"
                              : badgeColor
                          }`}>
                          {letter}
                        </span>

                        <input
                          type="text"
                          value={opt.text}
                          readOnly={isTrueFalse}
                          placeholder={`Opción ${letter}`}
                          onChange={(e) =>
                            handleOptionTextChange(opt.id, e.target.value)
                          }
                          className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-default-400 focus:outline-none"
                        />

                        <Button
                          type="button"
                          size="sm"
                          radius="full"
                          variant={opt.isCorrect ? "solid" : "bordered"}
                          onPress={() => handleMarkCorrect(opt.id)}
                          startContent={<LuCheck size={13} />}
                          className={`h-8 px-3 text-xs font-semibold shrink-0 ${
                            opt.isCorrect
                              ? "bg-emerald-600 text-white"
                              : "border-divider text-default-500 hover:border-emerald-500 hover:text-emerald-600"
                          }`}>
                          {opt.isCorrect ? "Correcta" : "Marcar"}
                        </Button>

                        {!isTrueFalse &&
                          currentQuestion.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteOption(opt.id)}
                              aria-label={`Eliminar opción ${letter}`}
                              className="p-1.5 text-default-400 hover:text-danger transition-colors shrink-0">
                              <LuTrash2 size={15} />
                            </button>
                          )}
                      </div>
                    );
                  })}

                  {currentQuestion.type === "multiple" &&
                    currentQuestion.options.length <
                      OPTION_LETTERS.length && (
                      <div className="pt-1">
                        <Button
                          type="button"
                          size="sm"
                          radius="full"
                          variant="flat"
                          color="primary"
                          startContent={<LuPlus size={14} />}
                          onPress={handleAddOption}
                          className="font-semibold text-xs">
                          Agregar respuesta
                        </Button>
                      </div>
                    )}
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label
                  htmlFor="question-explanation"
                  className="block text-xs font-medium text-default-500 mb-2">
                  Explicación ·{" "}
                  <span className="font-normal text-default-400">
                    se muestra al responder
                  </span>
                </label>
                <Controller
                  key={`explanation-${activeFieldKey}`}
                  name={`questions.${activeIndex}.explanation`}
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      id="question-explanation"
                      placeholder="Explica por qué esta es la respuesta correcta..."
                      variant="bordered"
                      radius="lg"
                      minRows={2}
                      value={field.value ?? ""}
                      onValueChange={(val) => {
                        field.onChange(val);
                        markDirty();
                      }}
                      onBlur={field.onBlur}
                      classNames={{
                        inputWrapper:
                          "bg-content1 border-divider shadow-none data-[hover=true]:border-primary-300 group-data-[focus=true]:border-primary",
                        input: "text-sm text-foreground",
                      }}
                    />
                  )}
                />
              </div>
            </div>
          </main>

          {/* ── Right Column: Settings & AI ── */}
          <aside className="flex flex-col gap-5">
            {/* Settings Card */}
            <div className="rounded-2xl border border-divider bg-content1 p-5 shadow-sm flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-bold text-foreground">
                    Configuración
                  </h2>
                  <Chip
                    size="sm"
                    variant="flat"
                    color="primary"
                    classNames={{
                      base: "bg-primary/10",
                      content: "text-[11px] font-semibold text-primary",
                    }}>
                    Pregunta {activeIndex + 1}
                  </Chip>
                </div>
                <p className="text-xs text-default-400">
                  Ajustes individuales para esta pregunta
                </p>
              </div>

              <Controller
                key={`time-${activeFieldKey}`}
                name={`questions.${activeIndex}.timeLimit`}
                control={control}
                render={({ field }) => (
                  <Select
                    label="Tiempo límite"
                    labelPlacement="outside"
                    variant="bordered"
                    radius="lg"
                    selectedKeys={[field.value]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      if (selected) {
                        field.onChange(selected);
                        markDirty();
                      }
                    }}
                    classNames={{
                      label: "text-xs font-medium text-default-500",
                      trigger:
                        "h-10 bg-content1 border-divider shadow-none data-[hover=true]:border-primary-300",
                      value: "text-sm text-foreground",
                    }}>
                    {TIME_LIMIT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.key}>{opt.label}</SelectItem>
                    ))}
                  </Select>
                )}
              />

              <Controller
                key={`points-${activeFieldKey}`}
                name={`questions.${activeIndex}.points`}
                control={control}
                render={({ field }) => (
                  <Select
                    label="Puntos"
                    labelPlacement="outside"
                    variant="bordered"
                    radius="lg"
                    selectedKeys={[field.value]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      if (selected) {
                        field.onChange(selected);
                        markDirty();
                      }
                    }}
                    classNames={{
                      label: "text-xs font-medium text-default-500",
                      trigger:
                        "h-10 bg-content1 border-divider shadow-none data-[hover=true]:border-primary-300",
                      value: "text-sm text-foreground",
                    }}>
                    {POINTS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.key}>{opt.label}</SelectItem>
                    ))}
                  </Select>
                )}
              />

              {/* Difficulty */}
              <div>
                <p className="text-xs font-medium text-default-500 mb-2">
                  Dificultad
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {DIFFICULTY_OPTIONS.map((diff) => {
                    const selected = currentQuestion.difficulty === diff.key;
                    return (
                      <Button
                        key={diff.key}
                        type="button"
                        size="sm"
                        radius="full"
                        variant="bordered"
                        onPress={() => setQuestionField("difficulty", diff.key)}
                        className={`h-8 text-xs font-medium ${
                          selected
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : "border-divider text-default-500 hover:border-primary/40"
                        }`}>
                        {diff.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Shuffle answers */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-foreground">
                  Mezclar orden de respuestas
                </span>
                <Controller
                  key={`shuffle-${activeFieldKey}`}
                  name={`questions.${activeIndex}.shuffleOptions`}
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      size="sm"
                      color="primary"
                      isSelected={field.value}
                      onValueChange={(checked) => {
                        field.onChange(checked);
                        markDirty();
                      }}
                      aria-label="Mezclar orden de respuestas"
                    />
                  )}
                />
              </div>
            </div>

            {/* AI Assistant Card */}
            <div className="rounded-2xl border border-primary/25 bg-[linear-gradient(145deg,rgba(255,101,63,0.14)_0%,rgba(255,101,63,0.06)_100%)] p-5 flex flex-col gap-3">
              <div className="flex items-center gap-1.5 text-sm font-bold text-primary-700 dark:text-primary-400">
                <LuSparkles size={15} />
                <span>Quizzify.IA</span>
              </div>
              <p className="text-xs leading-relaxed text-default-600 dark:text-default-400">
                Sugiere respuestas incorrectas creíbles o reescribe la pregunta
                para que sea más clara.
              </p>

              <div className="flex flex-col gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  radius="full"
                  onPress={handleSuggestDistractors}
                  className="bg-foreground text-background font-semibold h-9">
                  Sugerir distractores
                </Button>
                <Button
                  type="button"
                  size="sm"
                  radius="full"
                  variant="bordered"
                  onPress={handleImproveWording}
                  className="border-primary/40 bg-content1/80 text-primary-700 dark:text-primary-400 font-semibold h-9">
                  Mejorar redacción
                </Button>
              </div>

              {uiState.aiFeedback && (
                <p className="text-[11px] font-medium text-primary-700 dark:text-primary-400 pt-1">
                  {uiState.aiFeedback}
                </p>
              )}
            </div>
          </aside>
        </div>
      </form>

      {/* ════════════════════════ Preview Modal ════════════════════════ */}
      <Modal
        isOpen={isPreviewOpen}
        onOpenChange={onPreviewOpenChange}
        size="lg"
        backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <span className="text-xs font-medium text-primary">
                  Vista previa · Pregunta {activeIndex + 1} de{" "}
                  {questionFields.length}
                </span>
                <span className="text-lg font-bold text-foreground">
                  {watchedTitle}
                </span>
              </ModalHeader>
              <ModalBody className="gap-4">
                <p className="text-base font-semibold text-foreground">
                  {currentQuestion.prompt || "Pregunta sin título"}
                </p>

                <div className="flex flex-col gap-2">
                  {currentQuestion.options.map((opt, idx) => (
                    <div
                      key={opt.id}
                      className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm ${
                        opt.isCorrect
                          ? "border-emerald-600 bg-emerald-500/10 font-medium"
                          : "border-divider"
                      }`}>
                      <span
                        className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold shrink-0 ${
                          OPTION_BADGE_STYLES[
                            idx % OPTION_BADGE_STYLES.length
                          ]
                        }`}>
                        {OPTION_LETTERS[idx]}
                      </span>
                      <span className="flex-1">
                        {opt.text || `Opción ${OPTION_LETTERS[idx]}`}
                      </span>
                      {opt.isCorrect && (
                        <Chip size="sm" color="success" variant="flat">
                          Correcta
                        </Chip>
                      )}
                    </div>
                  ))}
                </div>

                {currentQuestion.explanation && (
                  <div className="rounded-xl bg-content2 p-3 text-xs text-default-600">
                    <span className="font-semibold text-foreground">
                      Explicación:{" "}
                    </span>
                    {currentQuestion.explanation}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cerrar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
