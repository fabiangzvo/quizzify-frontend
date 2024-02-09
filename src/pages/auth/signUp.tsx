import { useContext, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/router";
import Link from "next/link";

import Layout from "@components/layout";
import FormInput from "@components/formInput";
import { UserSignUp } from "@/types/User";
import { postSignUp } from "@api/user";
import { AuthContext } from "@context/AuthContext";
import Brain from "@components/icons/lightBrain";
import SubmitButton from "@components/submitButton";

function SignUp() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { refreshAuthContext } = useContext(AuthContext);
  const { handleSubmit, control } = useForm<UserSignUp>({
    mode: "onSubmit",
  });

  const onSubmit: SubmitHandler<UserSignUp> = async (data) => {
    setIsLoading(true);
    const response = await postSignUp(data);

    if (response?.status === 200) {
      const { accessToken } = response.data;

      localStorage.setItem("token", accessToken);
      setError("");
      refreshAuthContext();
      setIsLoading(false);
      router.push("/");
    } else {
      setError("user has not been created");
    }
  };

  return (
    <Layout>
      <form
        className="flex flex-col h-full w-3/5 justify-around items-center"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col items-center">
          <Brain width={100} height={100} />
          <h1 className="text-xl font-bold">Quizzify</h1>
        </div>
        <div className="w-3/4 flex flex-col justify-center items-center">
          <span className="text-2xl font-bold mb-10">Sign up</span>
          <FormInput
            type="text"
            control={control}
            label="Full name"
            name="fullName"
            isRequired
          />
          <FormInput
            type="text"
            control={control}
            label="User name"
            name="userName"
            isRequired
          />
          <FormInput
            type="email"
            control={control}
            label="Email"
            name="email"
            config={{
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Entered value does not match email format",
              },
            }}
            isRequired
          />
          <FormInput
            type="password"
            control={control}
            label="Password"
            name="password"
            isRequired
          />
          <div className="-mt-2 mb-8 h-4">
            {error && (
              <span className="text-red-500 font-semibold text-xl">
                {error}
              </span>
            )}
          </div>
          <SubmitButton label="Sign in" isLoading={isLoading} />
        </div>
        <span className="text-xl text-center pt-5 max-md:text-lg">
          Already have an account?&nbsp;
          <Link
            className="text-2xl max-md:text-xl text-paragraph font-extrabold hover:underline"
            href="/auth/signIn"
          >
            Sign in
          </Link>
        </span>
      </form>
    </Layout>
  );
}

export default SignUp;
