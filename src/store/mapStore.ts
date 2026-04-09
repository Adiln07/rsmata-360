import { create } from "zustand";
import { mapApi } from "@/api/MapApi";

type Rooms = {
  id: number;
  name: string;
  image: string;
  pos_x: Float16Array;
  pos_y: Float16Array;
  status: number;
};

type Floor = {
  id: number;
  name: string;
  floor_plan: string;
  status: number;
  rooms: Rooms[];
};

type MapStrore = {
  floors: Floor[];
  floorById: Floor | null;
  floorId: number | null;
  loading: boolean;
  error: string | null;

  fetchGetAllFloorsWithRooms: () => Promise<void>;
  fetchGetFloorsWithRoomById: (id: number) => Promise<void>;

  setFloorId: (id: number) => void;
};

export const useMapStore = create<MapStrore>((set) => ({
  floors: [],
  floorById: null,
  floorId: 1,
  loading: false,
  error: null,

  fetchGetAllFloorsWithRooms: async () => {
    try {
      const response = await mapApi.getAllFloorsWithRooms();
      set({ floors: response.data || [], loading: false });
    } catch (error) {
      set({ error: "Failed get All floors With Room", loading: false });
    }
  },
  fetchGetFloorsWithRoomById: async (id: number) => {
    try {
      const response = await mapApi.getFloorWithRoomById(id);
      set({ floorById: response.data || null, loading: false });
    } catch (error) {
      set({ error: "Error Get Floor With Room By Id", loading: false });
    }
  },

  setFloorId: (id: number) => set({ floorId: id }),
}));
