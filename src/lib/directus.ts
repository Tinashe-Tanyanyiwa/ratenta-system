import {
  createDirectus,
  rest,
  readItems,
  readItem,
  createItem,
  updateItem,
  deleteItem,
  authentication,
  readMe,
} from "@directus/sdk";

const DIRECTUS_URL =
  import.meta.env.VITE_DIRECTUS_URL || "http://157.173.110.74:4000";

// Define types matching Directus collections
export interface DirectusFarmer {
  id: string;
  status: string;
  sort?: number;
  user_created?: string;
  date_created?: string;
  user_updated?: string;
  date_updated?: string;
  grower_number: string;
  first_name: string;
  last_name: string;
  national_id?: string;
  phone_number?: string;
  email?: string;
  farm_location?: string;
}

export interface DirectusBox {
  id: string;
  status: string;
  sort?: number;
  user_created?: string;
  date_created?: string;
  user_updated?: string;
  date_updated?: string;
  box_number: string;
  description?: string;
  filter?: string;
  box_status?: string;
  bales?: string[];
}

export interface DirectusBale {
  id: string;
  status: string;
  sort?: number;
  user_created?: string;
  date_created?: string;
  user_updated?: string;
  date_updated?: string;
  box?: string | DirectusBox;
  has_fault?: boolean;
  fault_description?: string;
  classification?: string;
  group_number?: string;
  date?: string;
  SEQ?: string;
  appeal?: string;
  grower_number?: string | DirectusFarmer;
  mass?: number;
  lot_number?: string;
  trade?: string;
  price?: number;
  buyer?: string;
  buyers_mark?: string;
  bar_code?: string;
  frlsle?: string;
  var?: string;
  ro?: string;
  rb?: string;
  xx?: string;
  co?: string;
  rep?: string;
}

export interface DirectusBaleShipment {
  id: string;
  sort?: string;
  user_created?: string;
  date_created?: string;
  user_updated?: string;
  date_updated?: string;
  filters?: string;
  status?: string;
  departure_date?: string;
  arrival_date?: string;
  bales?: string[];
}

export interface DirectusUser {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role?: string;
}

interface BalesQueryParams {
  limit: number;
  sort: string[];
  fields: string[];
  filter?: any; // Define the appropriate type for filter, based on your API structure
}

// Create the Directus client with static token
const directus = createDirectus(DIRECTUS_URL)
  .with(rest())
  .with(authentication());

// Set the static token

// Farmers API
export const farmersApi = {
  async getAll(): Promise<DirectusFarmer[]> {
    try {
      const response = await directus.request(
        readItems("farmers", {
          limit: -1,
          sort: ["-date_created"],
        })
      );
      return response as DirectusFarmer[];
    } catch (error) {
      console.error("Error fetching farmers:", error);
      return [];
    }
  },

  async getById(id: string): Promise<DirectusFarmer | null> {
    try {
      const response = await directus.request(readItem("farmers", id));
      return response as DirectusFarmer;
    } catch (error) {
      console.error("Error fetching farmer:", error);
      return null;
    }
  },

  async create(data: Partial<DirectusFarmer>): Promise<DirectusFarmer | null> {
    try {
      const response = await directus.request(createItem("farmers", data));
      return response as DirectusFarmer;
    } catch (error) {
      console.error("Error creating farmer:", error);
      throw error;
    }
  },

  async update(
    id: string,
    data: Partial<DirectusFarmer>
  ): Promise<DirectusFarmer | null> {
    try {
      const response = await directus.request(updateItem("farmers", id, data));
      return response as DirectusFarmer;
    } catch (error) {
      console.error("Error updating farmer:", error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await directus.request(deleteItem("farmers", id));
    } catch (error) {
      console.error("Error deleting farmer:", error);
      throw error;
    }
  },
};

// Boxes API
export const boxesApi = {
  async getAll(): Promise<DirectusBox[]> {
    try {
      const response = await directus.request(
        readItems("boxes", {
          limit: -1,
          sort: ["-date_created"],
        })
      );
      return response as DirectusBox[];
    } catch (error) {
      console.error("Error fetching boxes:", error);
      return [];
    }
  },

  async getById(id: string): Promise<DirectusBox | null> {
    try {
      const response = await directus.request(readItem("boxes", id));
      return response as DirectusBox;
    } catch (error) {
      console.error("Error fetching box:", error);
      return null;
    }
  },

  async create(data: Partial<DirectusBox>): Promise<DirectusBox | null> {
    try {
      const response = await directus.request(createItem("boxes", data));
      return response as DirectusBox;
    } catch (error) {
      console.error("Error creating box:", error);
      throw error;
    }
  },

  async update(
    id: string,
    data: Partial<DirectusBox>
  ): Promise<DirectusBox | null> {
    try {
      const response = await directus.request(updateItem("boxes", id, data));
      return response as DirectusBox;
    } catch (error) {
      console.error("Error updating box:", error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await directus.request(deleteItem("boxes", id));
    } catch (error) {
      console.error("Error deleting box:", error);
      throw error;
    }
  },
};

// Bales API
export const balesApi = {
  async getAll(boxId?: string): Promise<DirectusBale[]> {
    try {
      const params: BalesQueryParams = {
        limit: -1,
        sort: ["-date_created"],
        fields: ["*", "grower_number.*", "box.*"],
      };

      // If boxId is provided, add it to the filter
      if (boxId) {
        params.filter = {
          box: { _eq: boxId }, // Make sure this matches your Directus schema
        };
      }

      const response = await directus.request(readItems("bales", params));

      return response as DirectusBale[];
    } catch (error) {
      console.error("Error fetching bales:", error);
      return [];
    }
  },

  async getById(id: string): Promise<DirectusBale | null> {
    try {
      const response = await directus.request(
        readItem("bales", id, {
          fields: ["*", "grower_number.*", "box.*"],
        })
      );
      return response as DirectusBale;
    } catch (error) {
      console.error("Error fetching bale:", error);
      return null;
    }
  },

  async getByBarcode(barcode: string): Promise<DirectusBale | null> {
    try {
      const response = await directus.request(
        readItems("bales", {
          filter: {
            bar_code: { _eq: barcode },
          },
          fields: ["*", "grower_number.*", "box.*"],
          limit: 1,
        })
      );
      return (response as DirectusBale[])[0] || null;
    } catch (error) {
      console.error("Error fetching bale by barcode:", error);
      return null;
    }
  },

  async create(data: Partial<DirectusBale>): Promise<DirectusBale | null> {
    try {
      const response = await directus.request(createItem("bales", data));
      return response as DirectusBale;
    } catch (error) {
      console.error("Error creating bale:", error);
      throw error;
    }
  },

  async update(
    id: string,
    data: Partial<DirectusBale>
  ): Promise<DirectusBale | null> {
    try {
      const response = await directus.request(updateItem("bales", id, data));
      return response as DirectusBale;
    } catch (error) {
      console.error("Error updating bale:", error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await directus.request(deleteItem("bales", id));
    } catch (error) {
      console.error("Error deleting bale:", error);
      throw error;
    }
  },
};

//BalesShipments API
export const baleShipmentsApi = {
  async getAll(): Promise<DirectusBaleShipment[]> {
    try {
      const response = await directus.request(
        readItems("bale_shipment", {
          limit: -1,
          sort: ["-date_created"],
        })
      );
      return response as DirectusBaleShipment[];
    } catch (error) {
      console.error("Error fetching bale shipments:", error);
      return [];
    }
  },

  async getById(id: string): Promise<DirectusBaleShipment | null> {
    try {
      const response = await directus.request(readItem("bale_shipment", id));
      return response as DirectusBaleShipment;
    } catch (error) {
      console.error("Error fetching box:", error);
      return null;
    }
  },

  async create(
    data: Partial<DirectusBaleShipment>
  ): Promise<DirectusBaleShipment | null> {
    try {
      const response = await directus.request(
        createItem("bale_shipment", data)
      );
      return response as DirectusBaleShipment;
    } catch (error) {
      console.error("Error creating box:", error);
      throw error;
    }
  },

  async update(
    id: string,
    data: Partial<DirectusBaleShipment>
  ): Promise<DirectusBaleShipment | null> {
    try {
      const response = await directus.request(
        updateItem("bale_shipment", id, data)
      );
      return response as DirectusBaleShipment;
    } catch (error) {
      console.error("Error updating box:", error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await directus.request(deleteItem("bale_shipment", id));
    } catch (error) {
      console.error("Error deleting bale:", error);
      throw error;
    }
  },
};

// Auth API
export const authApi = {
  async login(email: string, password: string) {
    await directus.login({
      email,
      password,
    });
    return directus.request(readMe());
  },

  async logout() {
    await directus.logout();
  },

  async getCurrentUser() {
    return directus.request(readMe());
  },
};

export default directus;
