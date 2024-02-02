import { useState, useCallback } from "react";

import { getAllTest } from "@api/test";
import { TestBasicInfo } from "@/types/Test";
import LinkCardItem from "@components/linkCardItem";
import useFetchData from "@hooks/useFetchData";
import Loader from "@components/loader";

export default function Home() {
  const [tests, setTests] = useState([] as TestBasicInfo[]);

  const getAllTestFunc = useCallback(async () => {
    const response = await getAllTest();

    setTests(response);
  }, []);

  const { loading } = useFetchData({ fetchData: getAllTestFunc });

  return (
    <main className={"flex min-h-screen items-center justify-center p-24 "}>
      <div className="w-2/4 h-[80vh] flex flex-col  items-center p-10 border border-gray-600 rounded-xl shadow-gray-900">
        <h1 className="text-xl font-bold mx-5 mb-10">Quizzes</h1>
        <ul>
          <Loader
            isLoading={loading}
            component={tests.map((test) => (
              <LinkCardItem key={test.id} {...test} />
            ))}
          />
        </ul>
      </div>
    </main>
  );
}
