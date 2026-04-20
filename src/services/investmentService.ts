import api from "./api";
import type { Investment } from "../types";

export const investmentService = {
  async getAll(): Promise<Investment[]> {
    const res = await api.get("/investments");
    return res.data;
  },

  async create(data: {
    name: string;
    type: string;
    principal: number;
    rate: number;
    period: number;
  }): Promise<Investment> {
    const res = await api.post("/investments", data);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/investments/${id}`);
  },
};
