import { useEffect, useState } from "react";

import { getAllTest } from "@api/Test";
import { TestBasicInfo } from "@/types/Test";
import LinkCardItem from "@components/linkCardItem";

export default function Home() {
  const [tests, setTests] = useState([] as TestBasicInfo[]);

  useEffect(() => {
    async function getInitialData() {
      const response = await getAllTest();

      setTests(response);
    }

    getInitialData();
  }, []);

  return (
    <main
      className={"flex min-h-screen flex-col items-center justify-between p-24"}
    >
      <div className="w-2/4 ">
        <h1 className="text-xl font-bold mx-5">Quizzes</h1>
        <ul>
          {tests.map((test) => (
            <LinkCardItem key={test.id} {...test} />
          ))}
        </ul>
      </div>
    </main>
  );
}
