import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/router";
import Link from "next/link";

import Layout from "@components/layout";
import FormInput from "@components/formInput";
import { UserSignIn } from "@/types/User";
import { postSignIn } from "@api/user";
import Brain from "@components/icons/lightBrain";
import SubmitButton from "@components/submitButton";

function SignIn() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { handleSubmit, control } = useForm<UserSignIn>({
    mode: "onSubmit",
  });

  const onSubmit: SubmitHandler<UserSignIn> = async (data) => {
    setIsLoading(true);
    const response = await postSignIn(data);

    switch (response?.status) {
      case 404:
        setError("User nor exist");
        break;
      case 200:
        setError("");
        localStorage.setItem("token", response.data.accessToken);
        router.push("/");
        break;
      default:
        setError("Error");
    }
    setIsLoading(false);
  };

  return (
    <Layout>
      <form
        className="flex flex-col h-full w-3/5 max-lg:w-full justify-around items-center"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col items-center">
          <Brain width={100} height={100} />
          <h1 className="text-xl font-bold">Quizzify</h1>
        </div>
        <div className="w-3/4 flex flex-col justify-center items-center">
          <span className="text-2xl font-bold mb-10">Sign in</span>
          <FormInput
            type="text"
            control={control}
            label="Email"
            name="email"
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
          Don&apos;t have an account?&nbsp;
          <Link
            className="text-2xl max-md:text-xl text-paragraph font-extrabold hover:underline"
            href="/auth/signUp"
          >
            Sign up
          </Link>
        </span>
      </form>
    </Layout>
  );
}

export default SignIn;
