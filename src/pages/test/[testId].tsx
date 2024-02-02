import { useRouter } from "next/router";

function TestPage() {
  const router = useRouter();
  return <div>{router.query.testId}</div>;
}

export default TestPage;
