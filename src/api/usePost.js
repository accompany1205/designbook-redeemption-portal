import { useState } from "react";
import client from "./client";

function usePost(url) {
  const [state, setState] = useState({ data: null, error: null, loading: false });

  const post = async (body) => {
    setState({ data: null, error: null, loading: true });
    client
      .post(url, body)
      .then((response) => {
        setState({ data: response.data, error: null, loading: false });
      })
      .catch((err) => {
        setState({ data: null, error: err, loading: false });
      })
  };
  return [post, state];
}

export default usePost;
