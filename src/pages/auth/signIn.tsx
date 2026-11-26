import { useState, useContext } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useForm, useController, SubmitHandler } from "react-hook-form";
import { Button, Chip, Input, Link } from "@heroui/react";
import { LuEye, LuEyeOff } from "react-icons/lu";

import Brain from "@components/icons/lightBrain";
import ThemeButton from "@components/themeButton";
import { UserSignIn } from "@/types/User";
import { postSignIn } from "@api/user";
import { UserContext } from "@context/UserContext";
import { AuthContext } from "@context/AuthContext";

function SignIn() {
  const [authError, setAuthError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const router = useRouter();
  const { setUser } = useContext(UserContext);
  const { refreshAuthContext } = useContext(AuthContext);

  const { handleSubmit, control } = useForm<UserSignIn>({
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { field: emailField, fieldState: emailState } = useController({
    name: "email",
    control,
    rules: {
      required: "Ingresa tu correo electrónico.",
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Ingresa un correo en el formato tu@empresa.com.",
      },
    },
  });

  const { field: passwordField, fieldState: passwordState } = useController({
    name: "password",
    control,
    rules: {
      required: "Ingresa tu contraseña.",
    },
  });

  const onSubmit: SubmitHandler<UserSignIn> = async (data) => {
    setAuthError("");
    setStatusMessage("");
    setIsLoading(true);

    try {
      const response = await postSignIn(data);

      switch (response?.status) {
        case 200:
          localStorage.setItem("token", response.data.accessToken);
          refreshAuthContext();
          setUser(response.data);
          router.push("/");
          break;

        case 401:
        case 404:
          setAuthError(
            "Correo o contraseña incorrectos. Verifica tus datos e inténtalo de nuevo.",
          );
          break;

        default:
          setAuthError("No se pudo iniciar sesión. Inténtalo nuevamente.");
      }
    } catch {
      setAuthError("No se pudo iniciar sesión. Inténtalo nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Iniciar sesión | Quizzify</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/lightBrain.svg" sizes="any" />
      </Head>

      <div
        lang="es"
        className="relative min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-background text-foreground">
        <div className="absolute top-6 right-6 z-20">
          <ThemeButton />
        </div>
        <section
          aria-label="Presentación de Quizzify"
          className="relative overflow-hidden flex flex-col justify-between px-8 py-10 sm:px-12 sm:py-12 lg:px-14 lg:py-12 text-white bg-[linear-gradient(135deg,#B82E0E_0%,#D9411E_52%,#FF653F_100%)] dark:bg-[linear-gradient(135deg,#7A1D08_0%,#A82C10_52%,#D9411E_100%)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#751C08]/35 blur-3xl"
          />

          <div className="relative z-10 flex items-center gap-2.5">
            <Brain width={28} height={28} className="fill-white/85" />
            <span className="text-2xl font-bold tracking-tight text-white">
              Quizzify
            </span>
          </div>

          <div className="relative z-10 my-10 lg:my-auto max-w-lg">
            <Chip
              variant="bordered"
              size="sm"
              radius="full"
              classNames={{
                base: "border-white/30 bg-white/10 backdrop-blur-sm px-2.5 py-3.5 h-auto mb-6",
                content: "text-white text-xs font-medium tracking-wide",
              }}>
              Preguntas y respuestas
            </Chip>

            <h1 className="text-3xl sm:text-4xl xl:text-[2.75rem] font-bold leading-[1.12] tracking-tight text-white">
              Aprende jugando, mide lo que tu equipo sabe
            </h1>

            <p className="mt-5 text-base sm:text-lg leading-relaxed text-white/90 max-w-md">
              Crea cuestionarios en minutos, compártelos con un código y mira
              los resultados <em className="italic">en tiempo real</em>.
            </p>
          </div>

          <div className="relative z-10 flex items-end justify-between gap-4 pt-4">
            <div className="text-sm leading-relaxed">
              <p className="font-semibold text-white">
                ¿Tienes un código de sala?
              </p>
              <p className="text-white/90">
                Entra sin cuenta desde la pantalla de juego.
              </p>
            </div>
          </div>
        </section>

        <main className="flex flex-col justify-center items-center px-6 py-12 sm:px-10 lg:px-16 bg-background">
          <div className="w-full max-w-[400px]">
            <div>
              <h2 className="text-[1.75rem] sm:text-[2rem] font-bold tracking-tight text-foreground">
                Bienvenido de nuevo
              </h2>
              <p className="mt-1 text-sm text-default-500">
                Ingresa con tu correo para continuar.
              </p>
            </div>

            <form
              className="mt-7 flex flex-col gap-5"
              onSubmit={handleSubmit(onSubmit)}
              noValidate>
              <Input
                ref={emailField.ref}
                id="signin-email"
                name={emailField.name}
                type="email"
                label="Correo electrónico"
                labelPlacement="outside"
                placeholder="tu@empresa.com"
                autoComplete="username"
                spellCheck="false"
                autoCapitalize="none"
                autoCorrect="off"
                enterKeyHint="next"
                variant="bordered"
                radius="lg"
                isRequired
                validationBehavior="aria"
                value={emailField.value ?? ""}
                onValueChange={(value) => {
                  if (authError) setAuthError("");
                  emailField.onChange(value);
                }}
                onBlur={emailField.onBlur}
                isInvalid={!!emailState.error}
                errorMessage={emailState.error?.message}
                classNames={{
                  label: "text-sm font-medium text-foreground pb-1.5",
                  inputWrapper:
                    "h-12 min-h-[48px] bg-content1 border border-divider shadow-none data-[hover=true]:border-primary-300 dark:data-[hover=true]:border-primary-400 group-data-[focus=true]:border-primary dark:group-data-[focus=true]:border-primary-500 group-data-[focus=true]:ring-2 group-data-[focus=true]:ring-primary/20 dark:group-data-[focus=true]:ring-primary-500/25",
                  input:
                    "text-base text-foreground placeholder:text-default-400",
                  errorMessage: "text-xs font-medium text-danger pt-1",
                }}
              />

              <div className="flex flex-col">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label
                    id="signin-password-label"
                    htmlFor="signin-password"
                    className="text-sm font-medium text-foreground">
                    Contraseña{" "}
                    <span aria-hidden="true" className="text-danger">
                      *
                    </span>
                  </label>
                </div>

                <Input
                  ref={passwordField.ref}
                  id="signin-password"
                  aria-labelledby="signin-password-label"
                  name={passwordField.name}
                  type={isPasswordVisible ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="current-password"
                  enterKeyHint="done"
                  minLength={8}
                  variant="bordered"
                  radius="lg"
                  isRequired
                  validationBehavior="aria"
                  value={passwordField.value ?? ""}
                  onValueChange={(value) => {
                    if (authError) setAuthError("");
                    passwordField.onChange(value);
                  }}
                  onBlur={passwordField.onBlur}
                  isInvalid={!!passwordState.error}
                  errorMessage={passwordState.error?.message}
                  endContent={
                    <button
                      type="button"
                      onClick={() => setIsPasswordVisible((prev) => !prev)}
                      aria-pressed={isPasswordVisible}
                      aria-label={
                        isPasswordVisible
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                      className="flex items-center justify-center min-w-8 min-h-8 rounded-md text-default-500 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                      {isPasswordVisible ? (
                        <LuEyeOff size={20} aria-hidden="true" />
                      ) : (
                        <LuEye size={20} aria-hidden="true" />
                      )}
                    </button>
                  }
                  classNames={{
                    inputWrapper:
                      "h-12 min-h-[48px] bg-content1 border border-divider shadow-none data-[hover=true]:border-primary-300 dark:data-[hover=true]:border-primary-400 group-data-[focus=true]:border-primary dark:group-data-[focus=true]:border-primary-500 group-data-[focus=true]:ring-2 group-data-[focus=true]:ring-primary/20 dark:group-data-[focus=true]:ring-primary-500/25",
                    input:
                      "text-base text-foreground placeholder:text-default-400",
                    errorMessage: "text-xs font-medium text-danger pt-1",
                  }}
                />
              </div>

              {authError && (
                <div
                  role="alert"
                  className="rounded-xl border border-danger-200 bg-danger-50 px-3.5 py-2.5 text-sm font-medium text-danger-600 dark:text-danger-400">
                  {authError}
                </div>
              )}

              {statusMessage && !authError && (
                <div
                  role="status"
                  className="rounded-xl border border-primary-200 bg-primary-50 px-3.5 py-2.5 text-sm font-medium text-primary-700 dark:text-primary-800">
                  {statusMessage}
                </div>
              )}

              <Button
                type="submit"
                color="primary"
                radius="full"
                isLoading={isLoading}
                isDisabled={isLoading}
                className="h-12 min-h-[48px] w-full font-semibold text-base shadow-sm">
                Iniciar sesión
              </Button>
            </form>

            <p className="mt-7 text-center text-sm text-default-500">
              ¿Aún no tienes cuenta?{" "}
              <Link
                as={NextLink}
                href="/auth/signUp"
                className="text-sm font-semibold text-primary-700 dark:text-primary-600 hover:underline">
                Crear cuenta
              </Link>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}

export default SignIn;
