import { useMemo } from "react";

import { TestBasicInfo } from "@/types/Test";
import LinkCardItem from "@components/linkCardItem";

interface ListOfTestsProps {
  tests: Array<TestBasicInfo>;
}

function ListOfTests(props: ListOfTestsProps) {
  const { tests } = props;

  const testComponents = useMemo(
    () => tests.map((test) => <LinkCardItem key={test.id} {...test} />),
    [tests]
  );

  return (
    <ul className="h-[80vh] max-lg:h-[80vh] overflow-y-auto">
      {testComponents}
    </ul>
  );
}

export default ListOfTests;
