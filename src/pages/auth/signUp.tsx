import { useContext, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/router";
import Link from "next/link";

import Layout from "@components/layout";
import FormInput from "@components/formInput";
import { UserSignUp } from "@/types/User";
import { postSignUp } from "@api/user";
import { AuthContext } from "@context/AuthContext";

function SignUp() {
  const [error, setError] = useState("");

  const router = useRouter();
  const { refreshAuthContext } = useContext(AuthContext);
  const { handleSubmit, control } = useForm<UserSignUp>({
    mode: "onSubmit",
  });

  const onSubmit: SubmitHandler<UserSignUp> = async (data) => {
    const response = await postSignUp(data);

    if (response?.status === 200) {
      const { accessToken } = response.data;

      localStorage.setItem("token", accessToken);
      setError("");
      refreshAuthContext();
      router.push("/");
    } else {
      setError("user has not been created");
    }
  };

  return (
    <Layout>
      <form
        className="flex flex-col h-full w-3/5 justify-around"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h1 className="text-xl font-bold text-center">Sign up</h1>
        <div>
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
