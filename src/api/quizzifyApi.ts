import axios from "axios";

import {
  getResponse,
  onRequestConfig,
  rejectResponse,
} from "../shared/axiosConfig";

const QuizzifyAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_QUIZZIFY_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

QuizzifyAxios.interceptors.response.use(getResponse, rejectResponse);

QuizzifyAxios.interceptors.request.use(onRequestConfig);

export default QuizzifyAxios;
