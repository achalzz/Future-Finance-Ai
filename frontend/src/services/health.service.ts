import { api } from "./api";

export const checkBackend = async () => {
  const response = await api.get("/health");
  return response.data;
};
