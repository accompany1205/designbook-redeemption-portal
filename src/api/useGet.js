import { useEffect, useState } from "react";
import client from "./client";

export function useGet(url) {
  const [requestState, setRequestState] = useState({
    data: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    console.log("Use effect called with url: ", url);
    client
      .get(url)
      .then((response) => {
        setRequestState({ data: response.data, error: null, loading: false });
      })
      .catch((error) => {
        setRequestState({ data: null, error: error, loading: false });
      });
  }, []);

  return requestState;
}
