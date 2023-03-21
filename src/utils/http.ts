/**
 * API endpoint specifications.
 *
 * @see HTTP<PathSpecs> for details on usage.
 */
export type PathSpecs = Record<string, string>;

export type GetQueryParams = {
  url: URL;
  headers?: Record<string, string>;
};
export type QueryParams = GetQueryParams & {
  content_type?: string;
  data?: Record<string, string>;
};

/**
 * Helper class for abstracting URL manipulation specifically for
 * API endpoints.
 *
 */
export class HTTP<PathSpecs> {
  apiPrefix: string;
  apiEndpoints: PathSpecs;

  /**
   * Constructor for `HTTP` helper class.
   *
   * `apiEndpoints` example:
   * ```javascript
   *	{
   *		getBalance: "/zilliqa/addresses/:address",
   *		listTransactions: "/zilliqa/addresses/:address/txs",
   *	};
   * ```
   *
   * @param apiPrefix prefix to add for all endpoints URL construction.
   * @param apiEndpoints see `apiEndpoints` example above.
   */
  constructor(apiPrefix: string, apiEndpoints: PathSpecs) {
    this.apiPrefix = apiPrefix;
    this.apiEndpoints = apiEndpoints;
  }

  /**
   * Path generator to obtain URL for a specific endpoint
   * provided in the constructor.
   *
   * example usage:
   * ```javascript
   * const http = new HTTP("http://localhost/api", { getUser: "/users/:user_id/detail" });
   * const url = http.path("getUser", { user_id: 42 }, { access_token: "awesomeAccessToken" });
   * // url: http://localhost/api/users/42/detail?access_token=awesomeAccessToken
   * ```
   *
   * @param path a key of apiEndpoints provided in the constructor.
   * @param routeParams object map for route parameters.
   * @param queryParams object map for query parameters.
   */
  path = (
    path: keyof PathSpecs,
    routeParams?: Record<string, string>,
    queryParams?: Record<string, string>
  ) => {
    let url = `${this.apiPrefix}${this.apiEndpoints[path]}`;

    // substitute route params
    if (routeParams) {
      for (const paramKey in routeParams)
        url = url.replace(`:${paramKey}`, routeParams[paramKey]);
    }

    // append query params
    if (queryParams && Object.keys(queryParams).length) {
      const params = new URLSearchParams(queryParams);
      url += `?${params}`;
    }
    return new URL(url);
  };

  /**
   * Executes HTTP GET request with fetch
   */
  get = async ({ url, headers }: GetQueryParams): Promise<Response> =>
    await fetch(url, {
      method: "GET",
      headers: headers,
    });

  /**
   * Executes HTTP POST request with fetch
   */
  post = ({
    url,
    data,
    content_type = "application/json",
    headers,
  }: QueryParams) =>
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": content_type || "application/json",
        ...headers,
      },
      body: JSON.stringify(data),
    });

  /**
   * Executes HTTP DELETE request with fetch
   */
  del = ({
    url,
    content_type = "application/json",
    headers,
    data,
  }: QueryParams) =>
    fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": content_type || "application/json",
        ...headers,
      },
      body: JSON.stringify(data),
    });

  /**
   * Executes HTTP multipart POST request with fetch
   */
  multi_post = ({ url, headers, data }: QueryParams) =>
    fetch(url, {
      method: "POST",
      headers: {
        ...headers,
      },
      body: JSON.stringify(data),
    });

  /**
   * Executes HTTP PUT request with fetch
   */
  put = ({ url, headers, data }: QueryParams) =>
    fetch(url, {
      method: "PUT",
      headers: {
        ...headers,
      },
      body: JSON.stringify(data),
    });

  /**
   * Executes HTTP PATCH request with fetch
   */
  patch = ({ url, headers, data }: QueryParams) =>
    fetch(url, {
      method: "PATCH",
      headers: {
        ...headers,
      },
      body: JSON.stringify(data),
    });
}
