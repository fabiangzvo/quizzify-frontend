import { useEffect, useContext, useState } from "react";

import { getResumeByUserId } from "@api/resume";
import { UserContext } from "@context/UserContext";
import { Resume } from "@/types/Resume";
import Loader from "@components/loader";
import ListOfResumes from "@components/listOfResumes";

function Resumes() {
  const [resumes, setResumes] = useState<Array<Resume>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { user } = useContext(UserContext);

  useEffect(() => {
    async function getInitialData() {
      if (!user) return;
      setIsLoading(true);
      const response = await getResumeByUserId({ userId: user._id });

      setResumes(response);
      setIsLoading(false);
    }

    getInitialData();
  }, [user]);
  return (
    <Loader
      isLoading={isLoading}
      component={<ListOfResumes resumes={resumes} />}
    />
  );
}

export default Resumes;
