import { env } from "@/env.mjs";
import { HTTP, isCEALicense, isName, logger } from "@/utils";

const Endpoint = `https://www.cea.gov.sg`;

const Routes: Record<string, string> = {
  ceaProfiles: `/aceas/api/internet/profile/v2/public-register/filter`,
};

export class Gov {
  private http: HTTP<typeof Routes>;
  public isNotValidated: boolean;

  constructor() {
    this.http = new HTTP(Endpoint, Routes);
    this.isNotValidated = env.NEXT_PUBLIC_BETA_PREVIEW === "true" ?? false;
  }

  checkIsCEALicensed = async (agentName: string, ceaLicense: string) => {
    let isValidAgent: boolean = isCEALicense(ceaLicense) && isName(agentName);
    if (this.isNotValidated) return isValidAgent;

    const data: Record<string, string> = {
      page: "1",
      pageSize: "10",
      sortAscFlag: "true",
      sort: "name",
      name: agentName,
      licenseNumber: ceaLicense,
      profileType: "1",
    };
    const url = this.http.path("ceaProfiles");

    try {
      const response = await this.http.post({ url, data });
      logger("gov.ts line 38", {
        url,
        data,
        response,
        body: response.body,
      });
      if (!response.ok) return isValidAgent;
      const result = await response.json();

      const matchingAgents = result?.data ?? [];
      isValidAgent = !!matchingAgents.length;
      logger("gov.ts line 49", { result, isValidAgent });
      return isValidAgent;
    } catch (error) {
      console.error("gov/checkIsCEALicensed", url, error);
    }
  };
}
