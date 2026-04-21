import api from "./api";
import type { Simulation } from "../types";

export const investmentService = {
  async getAll(): Promise<Simulation[]> {
    const res = await api.get("/simulations");
    return res.data;
  },

  async create(data: {
    name: string;
    type: string;
    principal: number;
    rate: number;
    period: number;
    periodUnit: string;
    contribution: number;
    contributionFrequency: string;
  }): Promise<Simulation> {
    const res = await api.post("/simulations", data);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/simulations/${id}`);
  },
};
