import axios from "axios";

const AxiosConfig = axios.create({
  baseURL:
    typeof window !== "undefined"
      ? `http://${window.location.hostname}:${process.env.NEXT_PUBLIC_BACKEND_PORT}`
      : "",
});

export default AxiosConfig;
