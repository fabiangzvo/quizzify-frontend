import { useState, useCallback } from "react";

import { getAllTest } from "@api/test";
import { TestBasicInfo } from "@/types/Test";
import ListOfTests from "@components/listOfTests";
import useFetchData from "@hooks/useFetchData";
import Loader from "@components/loader";

function Tests() {
  const [tests, setTests] = useState([] as TestBasicInfo[]);

  const getAllTestFunc = useCallback(async () => {
    const response = await getAllTest();

    setTests(response);
  }, []);

  const { loading } = useFetchData({ fetchData: getAllTestFunc });

  return (
    <Loader isLoading={loading} component={<ListOfTests tests={tests} />} />
  );
}

export default Tests;
