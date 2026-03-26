import AxiosConfig from "@/services/Axiosconfig";

export const mapApi = {
  getAllFloorsWithRooms: async () => {
    try {
      const response = await AxiosConfig.get("/api/map/floor-with-rooms");
      return response;
    } catch (error) {
      throw new Error("Failed Get Api All Floors With Rooms");
    }
  },

  getFloorWithRoomById: async (id: number) => {
    try {
      const response = await AxiosConfig.get(`/api/map/floor-with-rooms/${id}`);
      return response;
    } catch (error) {
      throw new Error("Failed Get Api Floor With Room By Id");
    }
  },
};
