import { useState, useEffect } from "react";

export interface DataFetchProps {
  fetchData(): Promise<void>;
}

function useDataFetch(props: DataFetchProps) {
  const { fetchData } = props;

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getData() {
      setLoading(true);

      await fetchData();

      setLoading(false);
    }

    getData();
  }, [fetchData]);

  return { loading };
}

export default useDataFetch;
