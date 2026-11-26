import {
  useState,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import NextLink from "next/link";
import {
  Button,
  Input,
  Chip,
  Tabs,
  Tab,
  Link,
  Avatar,
} from "@heroui/react";
import {
  LuHome,
  LuFileText,
  LuCompass,
  LuBarChart3,
  LuUsers,
  LuSearch,
  LuBell,
  LuPlus,
  LuLogOut,
} from "react-icons/lu";

import Brain from "@components/icons/lightBrain";
import ThemeButton from "@components/themeButton";
import { TestBasicInfo } from "@/types/Test";
import { Resume } from "@/types/Resume";
import { getAllTest } from "@api/test";
import { getResumeByUserId } from "@api/resume";
import { UserContext } from "@context/UserContext";
import { AuthContext } from "@context/AuthContext";

/* ─── Sidebar nav items ─── */
const navItems = [
  { label: "Inicio", icon: LuHome, href: "/", active: true },
  { label: "Mis cuestionarios", icon: LuFileText, href: "#" },
  { label: "Explorar", icon: LuCompass, href: "#" },
  { label: "Resultados", icon: LuBarChart3, href: "#" },
  { label: "Grupos", icon: LuUsers, href: "#" },
];

/* ─── Stat card ─── */
function StatCard({
  color,
  label,
  value,
  sub,
}: {
  color: string;
  label: string;
  value: string | number;
  sub: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-divider bg-content1 p-4 sm:p-5">
      <div className="flex items-center gap-2 text-xs text-default-500">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ background: color }}
        />
        {label}
      </div>
      <span className="text-2xl font-bold text-foreground">{value}</span>
      <span className="text-xs text-default-400">{sub}</span>
    </div>
  );
}

export default function Home() {
  const [tests, setTests] = useState<TestBasicInfo[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roomCode, setRoomCode] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const router = useRouter();
  const { user } = useContext(UserContext);
  const { refreshAuthContext, isAuthenticated, logout } =
    useContext(AuthContext);

  /* ── Auth guard ── */
  useEffect(() => {
    refreshAuthContext();
    const hasToken = !!window.localStorage.getItem("token");

    if (!hasToken) {
      router.push("/auth/signIn");
    }
  }, [router, refreshAuthContext]);

  /* ── Fetch data ── */
  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const testsData = await getAllTest();
      setTests(testsData);
    } catch {
      /* empty */
    }

    if (user) {
      try {
        const resumesData = await getResumeByUserId({ userId: user._id });
        setResumes(resumesData);
      } catch {
        /* empty */
      }
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) fetchAll();
  }, [isAuthenticated, fetchAll]);

  /* ── Derived data ── */
  const firstName = user?.fullName?.split(" ")[0] ?? "usuario";

  const totalQuestions = tests.reduce((sum, t) => sum + t.total, 0);
  const totalResponses = resumes.length;
  const avgScore =
    resumes.length > 0
      ? Math.round(
          (resumes.reduce((s, r) => s + r.rating, 0) / resumes.length) * 100,
        )
      : 0;

  const filteredTests = useMemo(() => {
    if (filter === "all") return tests;
    return tests;
  }, [tests, filter]);

  if (!isAuthenticated) return null;

  return (
    <>
      <Head>
        <title>Inicio | Quizzify</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/lightBrain.svg" sizes="any" />
      </Head>

      <div className="min-h-screen flex bg-background text-foreground">
        {/* ════════════════════════ Sidebar ════════════════════════ */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-divider bg-content1 px-4 py-6">
          {/* Logo */}
          <Link
            as={NextLink}
            href="/"
            className="flex items-center gap-2 px-2 mb-8">
            <Brain width={26} height={26} className="fill-primary" />
            <span className="text-xl font-bold tracking-tight text-foreground">
              Quizzify
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  as={NextLink}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-primary text-white"
                      : "text-default-600 hover:bg-content2 hover:text-foreground"
                  }`}>
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Spacer + logout */}
          <div className="mt-auto pt-6">
            <Button
              variant="light"
              startContent={<LuLogOut size={16} />}
              onPress={logout}
              className="w-full justify-start text-default-500 hover:text-danger">
              Cerrar sesión
            </Button>
          </div>
        </aside>

        {/* ════════════════════════ Main area ════════════════════════ */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* ── Top bar ── */}
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-divider bg-background/80 backdrop-blur-lg px-4 sm:px-6 lg:px-8 py-3">
            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-2 mr-2">
              <Brain width={22} height={22} className="fill-primary" />
              <span className="text-lg font-bold text-foreground">
                Quizzify
              </span>
            </div>

            {/* Search */}
            <Input
              startContent={
                <LuSearch
                  size={16}
                  className="text-default-400"
                  aria-hidden="true"
                />
              }
              placeholder="Buscar cuestionarios, temas o personas"
              variant="bordered"
              radius="lg"
              size="sm"
              classNames={{
                base: "max-w-md",
                inputWrapper:
                  "h-10 bg-content1 border-divider shadow-none data-[hover=true]:border-primary-300",
                input: "text-sm",
              }}
            />

            <div className="flex-1" />

            {/* Room code */}
            <div className="hidden sm:flex items-center gap-2">
              <Input
                placeholder="Código de sala"
                variant="bordered"
                radius="lg"
                size="sm"
                value={roomCode}
                onValueChange={setRoomCode}
                classNames={{
                  base: "w-36",
                  inputWrapper:
                    "h-10 bg-content1 border-divider shadow-none data-[hover=true]:border-primary-300",
                  input: "text-sm text-center tracking-widest",
                }}
              />
              <Button
                size="sm"
                radius="lg"
                className="h-10 bg-foreground text-background font-semibold px-5">
                Entrar
              </Button>
            </div>

            {/* Actions */}
            <ThemeButton />

            <Button
              isIconOnly
              variant="light"
              radius="full"
              size="sm"
              aria-label="Notificaciones"
              className="text-default-500">
              <LuBell size={18} />
            </Button>

            <Avatar
              name={firstName}
              size="sm"
              classNames={{
                base: "bg-primary/15 text-primary font-semibold",
              }}
            />
          </header>

          {/* ── Page content ── */}
          <div className="flex flex-1 overflow-hidden">
            {/* ── Center column ── */}
            <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
              {/* Greeting */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    Hola, {firstName}
                  </h1>
                  <p className="mt-1 text-sm text-default-500">
                    {resumes.length > 0
                      ? `Tienes ${resumes.length} cuestionario${resumes.length > 1 ? "s" : ""} por revisar.`
                      : "Crea tu primer cuestionario para empezar."}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="bordered"
                    radius="full"
                    className="border-primary text-primary font-semibold">
                    Nuevo cuestionario
                  </Button>
                  <Button
                    color="primary"
                    radius="full"
                    startContent={<LuPlus size={16} />}
                    className="font-semibold">
                    Crear pregunta
                  </Button>
                </div>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-8">
                <StatCard
                  color="#6366F1"
                  label="Cuestionarios creados"
                  value={tests.length}
                  sub={`${totalQuestions} preguntas en total`}
                />
                <StatCard
                  color="#FF653F"
                  label="Respuestas recibidas"
                  value={totalResponses}
                  sub="Últimos 30 días"
                />
                <StatCard
                  color="#F59E0B"
                  label="Precisión promedio"
                  value={`${avgScore}%`}
                  sub="De todos tus cuestionarios"
                />
                <StatCard
                  color="#10B981"
                  label="Tu racha"
                  value="—"
                  sub="Respondiendo seguido"
                />
              </div>

              {/* Quizzes table */}
              <div className="rounded-2xl border border-divider bg-content1 overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-3">
                  <h2 className="text-lg font-bold text-foreground">
                    Mis cuestionarios
                  </h2>
                  <Tabs
                    size="sm"
                    variant="solid"
                    radius="full"
                    selectedKey={filter}
                    onSelectionChange={(key) => setFilter(key as string)}
                    classNames={{
                      tabList: "bg-content2",
                      cursor: "bg-background shadow-sm",
                      tabContent:
                        "text-sm font-medium group-data-[selected=true]:text-foreground text-default-500",
                    }}>
                    <Tab key="all" title="Todos" />
                    <Tab key="active" title="Activos" />
                    <Tab key="draft" title="Borradores" />
                  </Tabs>
                </div>

                {/* Table header */}
                <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-2 px-5 py-2 text-xs font-medium text-default-400 uppercase tracking-wider border-b border-divider">
                  <span>Nombre</span>
                  <span className="text-center">Preguntas</span>
                  <span className="text-center">Respuestas</span>
                  <span className="text-center">Precisión</span>
                  <span className="text-center">Estado</span>
                  <span />
                </div>

                {/* Table rows */}
                {isLoading ? (
                  <div className="flex items-center justify-center py-16 text-default-400 text-sm">
                    Cargando cuestionarios…
                  </div>
                ) : filteredTests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-default-400 text-sm gap-2">
                    <p>No tienes cuestionarios aún.</p>
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      radius="full">
                      Crear uno
                    </Button>
                  </div>
                ) : (
                  <ul>
                    {filteredTests.map((test) => (
                      <li
                        key={test.id}
                        className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-2 items-center px-5 py-3.5 border-b border-divider last:border-b-0 hover:bg-content2/50 transition-colors">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {test.title}
                          </p>
                          <p className="text-xs text-default-400 truncate">
                            {test.description}
                          </p>
                        </div>
                        <span className="text-sm text-center text-foreground">
                          {test.total}
                        </span>
                        <span className="text-sm text-center text-foreground">
                          —
                        </span>
                        <span className="text-sm text-center text-foreground">
                          —
                        </span>
                        <div className="flex justify-center">
                          <Chip
                            size="sm"
                            variant="flat"
                            radius="full"
                            classNames={{
                              base: "bg-primary-50 dark:bg-primary-50/10",
                              content:
                                "text-xs font-medium text-primary-700 dark:text-primary-400",
                            }}>
                            Publicado
                          </Chip>
                        </div>
                        <Link
                          as={NextLink}
                          href={`/test/${test.id}`}
                          className="text-sm font-medium text-primary hover:underline">
                          Editar
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </main>

            {/* ── Right sidebar ── */}
            <aside className="hidden xl:flex flex-col gap-4 w-80 shrink-0 border-l border-divider bg-background overflow-y-auto px-5 py-6 lg:py-8">
              {/* Scheduled room card */}
              <div className="rounded-2xl bg-[linear-gradient(135deg,#1E1B2B_0%,#322E47_100%)] p-5 text-white">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-white/70">
                    Sala programada
                  </span>
                  <Chip
                    size="sm"
                    variant="flat"
                    radius="full"
                    classNames={{
                      base: "bg-primary/20",
                      content: "text-xs font-semibold text-primary-300",
                    }}>
                    Hoy
                  </Chip>
                </div>
                <h3 className="text-base font-bold leading-snug mb-4">
                  {tests[0]?.title ?? "Sin sala programada"}
                </h3>
                <p className="text-xs text-white/60 mb-1">
                  Código para unirse
                </p>
                <p className="text-3xl font-bold tracking-[0.25em] mb-4">
                  {roomCode || "— — —"}
                </p>
                <Button
                  color="primary"
                  radius="full"
                  className="w-full font-semibold">
                  Abrir sala en vivo
                </Button>
              </div>

              {/* Pending quizzes */}
              <div className="rounded-2xl border border-divider bg-content1 p-5">
                <h3 className="text-base font-bold text-foreground mb-4">
                  Por responder
                </h3>
                {resumes.length === 0 ? (
                  <p className="text-sm text-default-400">
                    No tienes cuestionarios pendientes.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {resumes.slice(0, 3).map((resume) => {
                      const title =
                        typeof resume.test !== "string"
                          ? resume.test.title
                          : "Cuestionario";
                      return (
                        <li
                          key={resume._id}
                          className="flex items-start justify-between gap-2 rounded-xl border border-divider p-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {title}
                            </p>
                            <p className="text-xs text-default-400 mt-0.5">
                              {resume.correctAnswers}/{resume.answers.length}{" "}
                              preguntas
                            </p>
                          </div>
                          <span className="text-xs text-default-400 shrink-0">
                            {new Date(
                              resume.presentedAt,
                            ).toLocaleDateString("es", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
