import { User } from "@prisma/client";

import { logger } from "@/utils/debug";
import { getPartialClonedObject } from "@/utils/helpers";
import { HTTP } from "@/utils/http";

const Endpoint = `https://flask-api-deployment.onrender.com`;

const Routes: Record<string, string> = {
  createUser: `/createUser`,
  getUser: `/getUser`,
  deleteUser: `/deleteUser/:userId`,
  updateUser: `/updateUser/:userId`,

  saveProperty: `/createUSP`,
  unsaveProperty: `/deleteUSP/:userId/:listingId`,
};

export class AccountV2 {
  private http: HTTP<typeof Routes>;

  constructor() {
    this.http = new HTTP(Endpoint, Routes);
  }

  getUser = async (id = "", email = "") => {
    if (!id.length && !email.length) return null;

    const params: Record<string, string> = {};
    if (id.length) params["id"] = id;
    if (email.length) params["email"] = email;
    if (!Object.keys(params).length) return null;

    const url = this.http.path("getUser", {}, params);

    try {
      const response = await this.http.get({ url });
      logger("accountV2.ts line 34", { url, response });
      if (!response.ok) return null;
      const result = await response.json();
      logger("accountv2.ts line 31", { result });
      return result;
    } catch (error) {
      console.error("AccountV2/getUser", url, error);
    }
  };

  createUser = async (name: string, email: string, rawPassword: string) => {
    if (!name.length || !email.length || !rawPassword.length) return null;

    const data = {
      name,
      email,
      password: rawPassword,
    };
    const url = this.http.path("createUser");

    try {
      const response = await this.http.post({ url, data });
      logger("accountV2.ts line 57/createUser", {
        url,
        data,
        response,
        body: response.body,
      });
      if (!response.ok) return null;
      const result = await response.json();
      logger("accountv2.ts line 31", { result });
      return result;
    } catch (error) {
      console.error("AccountV2/createUser", url, error);
    }
  };

  deleteUser = async (id: string) => {
    if (!id.length) return null;

    const params = {
      user_id: id,
    };
    const url = this.http.path("deleteUser", params);

    try {
      const response = await this.http.del({ url });
      if (!response.ok) return null;
      const result = await response.json();
      logger("accountv2.ts line 75", { result });
      return result;
    } catch (error) {
      console.error("AccountV2/deleteUser", url, error);
    }
  };

  updateUser = async ({ id, user }: { id: string; user: Partial<User> }) => {
    if (!id.length) return null;

    const routeParams: Record<string, string> = {
      user_id: id,
    };
    const data: Record<string, string> = getPartialClonedObject(
      user,
      ["name", "password", "image"],
      true
    ) as Record<string, string>;
    if (!Object.keys(data).length) return null;

    const url = this.http.path("updateUser", routeParams);

    try {
      const response = await this.http.patch({ url, data });
      if (!response.ok) return null;
      const result = await response.json();
      logger("accountv2.ts line 75", { result });
      return result;
    } catch (error) {
      console.error("AccountV2/deleteUser", url, error);
    }
  };

  saveProperty = async (
    userId: string,
    listingId: string,
    listingType: string,
    clusterId: string
  ) => {
    const data = {
      userID: userId,
      propertyId: listingId,
      property: {
        id: listingId,
        clusterId,
        type: listingType,
      },
    };

    const url = this.http.path("saveProperty");

    try {
      const response = await this.http.post({ url, data });
      logger("accountV2.ts line 57/createUSP", {
        url,
        data,
        response,
        body: response.body,
        ok: response.ok,
      });
      if (!response.ok) return null;
      const result = await response.json();
      logger("accountv2.ts line 31", { result });
      return result;
    } catch (error) {
      console.error("AccountV2/createUSP", url, error);
    }
  };

  unsaveProperty = async (userId: string, listingId: string) => {
    const params = {
      user_id: userId,
      prop_id: listingId,
    };
    const url = this.http.path("unsaveProperty", params);

    try {
      const response = await this.http.del({ url });
      if (!response.ok) return null;
      const result = await response.json();
      logger("accountv2.ts line 75", { result });
      return result;
    } catch (error) {
      console.error("AccountV2/deleteUSP", url, error);
    }
  };
}
