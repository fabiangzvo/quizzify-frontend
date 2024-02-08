import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/router";
import Link from "next/link";

import Layout from "@components/layout";
import FormInput from "@components/formInput";
import { UserSignIn } from "@/types/User";
import { postSignIn } from "@api/user";

function SignIn() {
  const [error, setError] = useState("");

  const router = useRouter();
  const { handleSubmit, control } = useForm<UserSignIn>({
    mode: "onSubmit",
  });

  const onSubmit: SubmitHandler<UserSignIn> = async (data) => {
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
  };

  return (
    <Layout>
      <form
        className="flex flex-col h-full w-3/5 justify-around"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h1 className="text-xl font-bold text-center">Sign in</h1>
        <div>
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
          <div className="w-full flex justify-center">
            <button
              type="submit"
              className="py-2.5 px-10 me-2 mb-2 text-lg font-medium focus:outline-none rounded-full border border-gray-600 focus:z-10 hover:bg-gray-800"
            >
              Sign up
            </button>
          </div>
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
