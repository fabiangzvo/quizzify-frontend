import Tests from "@components/tests";
import Resumes from "@components/resumes";
import Layout from "@components/layout";

export default function Home() {
  return (
    <Layout
      overrideClass="w-full grid grid-cols-5 gap-4 max-lg:grid-cols-1"
      heightClass="h-[85vh]"
    >
      <div className="col-span-3">
        <h1 className="text-center text-xl font-bold mx-5 mb-10">Quizzes</h1>
        <Tests />
      </div>
      <div className="col-span-2">
        <h1 className="text-center text-xl font-bold mx-5 mb-10">Resumes</h1>
        <Resumes />
      </div>
    </Layout>
  );
}
