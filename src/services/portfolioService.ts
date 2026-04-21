import api from "./api";
import type { PortfolioAsset, AddAssetRequest, UpdateAssetRequest } from "../types";

export const portfolioService = {
  async getAll(): Promise<PortfolioAsset[]> {
    const res = await api.get("/portfolio");
    return res.data;
  },

  async add(data: AddAssetRequest): Promise<PortfolioAsset> {
    const res = await api.post("/portfolio", data);
    return res.data;
  },

  async update(id: string, data: UpdateAssetRequest): Promise<PortfolioAsset> {
    const res = await api.put(`/portfolio/${id}`, data);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/portfolio/${id}`);
  },
};
