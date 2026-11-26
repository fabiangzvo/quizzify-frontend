import { useState, useContext } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useForm, useController, SubmitHandler } from "react-hook-form";
import { Button, Input, Link, Checkbox } from "@heroui/react";
import { LuEye, LuEyeOff } from "react-icons/lu";

import Brain from "@components/icons/lightBrain";
import ThemeButton from "@components/themeButton";
import { UserSignUp as UserSignUpType } from "@/types/User";
import { postSignUp } from "@api/user";
import { UserContext } from "@context/UserContext";
import { AuthContext } from "@context/AuthContext";

const steps = [
  {
    number: 1,
    title: "Escribe tus preguntas",
    description: "Opción múltiple, verdadero/falso o respuesta corta.",
  },
  {
    number: 2,
    title: "Comparte el código",
    description: "Tu equipo entra desde el celular o la computadora.",
  },
  {
    number: 3,
    title: "Revisa los resultados",
    description: "Aciertos por pregunta y ranking del grupo.",
  },
];

const inputWrapperClasses =
  "h-12 min-h-[48px] bg-content1 border border-divider shadow-none data-[hover=true]:border-primary-300 dark:data-[hover=true]:border-primary-400 group-data-[focus=true]:border-primary dark:group-data-[focus=true]:border-primary-500 group-data-[focus=true]:ring-2 group-data-[focus=true]:ring-primary/20 dark:group-data-[focus=true]:ring-primary-500/25";

const inputClasses =
  "text-base text-foreground placeholder:text-default-400";

const labelClasses = "text-sm font-medium text-foreground pb-1.5";

function SignUp() {
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const router = useRouter();
  const { setUser } = useContext(UserContext);
  const { refreshAuthContext } = useContext(AuthContext);

  const { handleSubmit, control } = useForm<UserSignUpType>({
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      userName: "",
      email: "",
      password: "",
    },
  });

  const { field: fullNameField, fieldState: fullNameState } = useController({
    name: "fullName",
    control,
    rules: {
      required: "Ingresa tu nombre completo.",
    },
  });

  const { field: userNameField, fieldState: userNameState } = useController({
    name: "userName",
    control,
    rules: {
      required: "Ingresa un nombre de usuario.",
      minLength: {
        value: 3,
        message: "El nombre de usuario debe tener al menos 3 caracteres.",
      },
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
      minLength: {
        value: 8,
        message: "La contraseña debe tener al menos 8 caracteres.",
      },
    },
  });

  const onSubmit: SubmitHandler<UserSignUpType> = async (data) => {
    setAuthError("");
    setIsLoading(true);

    try {
      const response = await postSignUp(data);

      if (response?.status === 200) {
        localStorage.setItem("token", response.data.accessToken);
        refreshAuthContext();
        setUser(response.data);
        router.push("/");
      } else {
        setAuthError("No se pudo crear la cuenta. Inténtalo nuevamente.");
      }
    } catch {
      setAuthError("No se pudo crear la cuenta. Inténtalo nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Crear cuenta | Quizzify</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/lightBrain.svg" sizes="any" />
      </Head>

      <div
        lang="es"
        className="relative min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-background text-foreground">
        <div className="absolute top-6 right-6 z-20">
          <ThemeButton />
        </div>

        {/* ── Left column: Form ── */}
        <main className="flex flex-col justify-center items-center px-6 py-12 sm:px-10 lg:px-16 bg-background order-2 lg:order-1">
          <div className="w-full max-w-[440px]">
            <div className="flex items-center gap-2.5 mb-8">
              <Brain width={28} height={28} className="fill-primary" />
              <span className="text-2xl font-bold tracking-tight text-foreground">
                Quizzify
              </span>
            </div>

            <div>
              <h2 className="text-[1.75rem] sm:text-[2rem] font-bold tracking-tight text-foreground">
                Crea tu cuenta
              </h2>
              <p className="mt-1 text-sm text-default-500">
                Toma menos de un minuto. Después podrás crear o responder
                cuestionarios.
              </p>
            </div>

            <form
              className="mt-7 flex flex-col gap-5"
              onSubmit={handleSubmit(onSubmit)}
              noValidate>
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  ref={fullNameField.ref}
                  id="signup-fullname"
                  name={fullNameField.name}
                  type="text"
                  label="Nombre completo"
                  labelPlacement="outside"
                  placeholder="Ana Martínez"
                  autoComplete="name"
                  variant="bordered"
                  radius="lg"
                  isRequired
                  validationBehavior="aria"
                  value={fullNameField.value ?? ""}
                  onValueChange={(value) => {
                    if (authError) setAuthError("");
                    fullNameField.onChange(value);
                  }}
                  onBlur={fullNameField.onBlur}
                  isInvalid={!!fullNameState.error}
                  errorMessage={fullNameState.error?.message}
                  classNames={{
                    label: labelClasses,
                    inputWrapper: inputWrapperClasses,
                    input: inputClasses,
                    errorMessage: "text-xs font-medium text-danger pt-1",
                  }}
                />

                <Input
                  ref={userNameField.ref}
                  id="signup-username"
                  name={userNameField.name}
                  type="text"
                  label="Usuario"
                  labelPlacement="outside"
                  placeholder="ana.martinez"
                  autoComplete="username"
                  variant="bordered"
                  radius="lg"
                  isRequired
                  validationBehavior="aria"
                  value={userNameField.value ?? ""}
                  onValueChange={(value) => {
                    if (authError) setAuthError("");
                    userNameField.onChange(value);
                  }}
                  onBlur={userNameField.onBlur}
                  isInvalid={!!userNameState.error}
                  errorMessage={userNameState.error?.message}
                  classNames={{
                    label: labelClasses,
                    inputWrapper: inputWrapperClasses,
                    input: inputClasses,
                    errorMessage: "text-xs font-medium text-danger pt-1",
                  }}
                />
              </div>

              {/* Email */}
              <Input
                ref={emailField.ref}
                id="signup-email"
                name={emailField.name}
                type="email"
                label="Correo electrónico"
                labelPlacement="outside"
                placeholder="tu@empresa.com"
                autoComplete="email"
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
                  label: labelClasses,
                  inputWrapper: inputWrapperClasses,
                  input: inputClasses,
                  errorMessage: "text-xs font-medium text-danger pt-1",
                }}
              />

              {/* Password */}
              <Input
                ref={passwordField.ref}
                id="signup-password"
                name={passwordField.name}
                type={isPasswordVisible ? "text" : "password"}
                label="Contraseña"
                labelPlacement="outside"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
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
                  label: labelClasses,
                  inputWrapper: inputWrapperClasses,
                  input: inputClasses,
                  errorMessage: "text-xs font-medium text-danger pt-1",
                }}
              />

              {/* Terms checkbox */}
              <Checkbox
                size="sm"
                isSelected={acceptedTerms}
                onValueChange={setAcceptedTerms}
                classNames={{
                  label: "text-sm text-default-500",
                }}>
                Acepto los{" "}
                <Link
                  as={NextLink}
                  href="/terms"
                  className="text-sm font-semibold text-primary-700 dark:text-primary-600 underline">
                  términos de uso
                </Link>{" "}
                y el{" "}
                <Link
                  as={NextLink}
                  href="/privacy"
                  className="text-sm font-semibold text-primary-700 dark:text-primary-600 underline">
                  aviso de privacidad
                </Link>
              </Checkbox>

              {authError && (
                <div
                  role="alert"
                  className="rounded-xl border border-danger-200 bg-danger-50 px-3.5 py-2.5 text-sm font-medium text-danger-600 dark:text-danger-400">
                  {authError}
                </div>
              )}

              <Button
                type="submit"
                color="primary"
                radius="full"
                isLoading={isLoading}
                isDisabled={isLoading || !acceptedTerms}
                className="h-12 min-h-[48px] w-full font-semibold text-base shadow-sm">
                Crear cuenta
              </Button>
            </form>

            <p className="mt-7 text-center text-sm text-default-500">
              ¿Ya tienes cuenta?{" "}
              <Link
                as={NextLink}
                href="/auth/signIn"
                className="text-sm font-semibold text-primary-700 dark:text-primary-600 hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>
        </main>

        {/* ── Right column: Steps panel ── */}
        <section
          aria-label="Pasos para crear tu primer cuestionario"
          className="relative overflow-hidden flex flex-col justify-center px-8 py-10 sm:px-12 sm:py-12 lg:px-14 lg:py-12 text-white bg-[linear-gradient(135deg,#B82E0E_0%,#D9411E_52%,#FF653F_100%)] dark:bg-[linear-gradient(135deg,#7A1D08_0%,#A82C10_52%,#D9411E_100%)] order-1 lg:order-2">
          {/* Decorative blurs */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#751C08]/35 blur-3xl"
          />

          <div className="relative z-10 max-w-md mx-auto lg:mx-0">
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-white mb-10">
              Tres pasos para tu primer cuestionario
            </h2>

            <ol className="flex flex-col gap-7">
              {steps.map((step) => (
                <li key={step.number} className="flex items-start gap-4">
                  <span className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-white/20 text-white font-bold text-sm">
                    {step.number}
                  </span>
                  <div>
                    <p className="font-semibold text-white text-base">
                      {step.title}
                    </p>
                    <p className="text-sm text-white/80 mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </>
  );
}

export default SignUp;
