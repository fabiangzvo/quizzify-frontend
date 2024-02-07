import { useState, useCallback } from "react";

import { getAllTest } from "@api/test";
import { TestBasicInfo } from "@/types/Test";
import ListOfTests from "@components/listOfTests";
import useFetchData from "@hooks/useFetchData";
import Loader from "@components/loader";
import Layout from "@components/layout";

export default function Home() {
  const [tests, setTests] = useState([] as TestBasicInfo[]);

  const getAllTestFunc = useCallback(async () => {
    const response = await getAllTest();

    setTests(response);
  }, []);

  const { loading } = useFetchData({ fetchData: getAllTestFunc });

  return (
    <Layout>
      <div className="w-[50vw] max-md:w-[90vw] h-[80vh] flex flex-col  items-center p-10 border border-gray-600 rounded-xl shadow-gray-900">
        <h1 className="text-xl font-bold mx-5 mb-10">Quizzes</h1>
        <Loader isLoading={loading} component={<ListOfTests tests={tests} />} />
      </div>
    </Layout>
  );
}
