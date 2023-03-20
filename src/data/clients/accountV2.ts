import { logger } from "@/utils/debug";
import { HTTP } from "@/utils/http";

const Endpoint = `https://flask-api-deployment.onrender.com/`;

const Routes: Record<string, string> = {
  createUser: `/createUser`,
  getUser: `/getUser`,
};

export class AccountV2 {
  private http: HTTP<typeof Routes>;

  constructor() {
    this.http = new HTTP(Endpoint, Routes);
  }

  getUser = async (id: string) => {
    if (!id.length) return null;

    const params = {
      id,
    };
    const url = this.http.path("getUser", {}, params);

    try {
      const response = await this.http.get({ url });
      if (!response.ok) return null;
      const result = await response.json();
      logger("accountv2.ts line 31", { result });
    } catch (error) {
      console.error("AccountV2/getUser", url, error);
    }
  };

  createUser = async (name: string, email: string, rawPassword: string) => {
    if (!name.length || !email.length || !rawPassword.length) return null;

    const data = {
      name,
      email,
      rawPassword,
    };
    const url = this.http.path("createUser");

    try {
      const response = await this.http.post({ url, data });
      if (!response.ok) return null;
      const result = await response.json();
      logger("accountv2.ts line 31", { result });
    } catch (error) {
      console.error("AccountV2/createUser", url, error);
    }
  };
}
