import { useMemo } from "react";

import ResumeItem from "@components/resumeItem";
import { Resume } from "@/types/Resume";

interface ListOfResumesProps {
  resumes: Array<Resume>;
}

function ListOfResumes(props: ListOfResumesProps) {
  const { resumes } = props;

  const testComponents = useMemo(
    () => resumes.map((resume) => <ResumeItem key={resume._id} {...resume} />),
    [resumes]
  );

  return (
    <ul className="h-[80vh] max-lg:h-[80vh] overflow-y-auto">
      {testComponents}
    </ul>
  );
}

export default ListOfResumes;
