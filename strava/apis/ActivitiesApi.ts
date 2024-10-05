/* tslint:disable */
/* eslint-disable */
/**
 * Strava API v3
 * The [Swagger Playground](https://developers.strava.com/playground) is the easiest way to familiarize yourself with the Strava API by submitting HTTP requests and observing the responses before you write any client code. It will show what a response will look like with different endpoints depending on the authorization scope you receive from your athletes. To use the Playground, go to https://www.strava.com/settings/api and change your “Authorization Callback Domain” to developers.strava.com. Please note, we only support Swagger 2.0. There is a known issue where you can only select one scope at a time. For more information, please check the section “client code” at https://developers.strava.com/docs.
 *
 * The version of the OpenAPI document: 3.0.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import * as runtime from "../runtime";
import type {
  ActivityZone,
  Comment,
  DetailedActivity,
  Fault,
  Lap,
  SummaryActivity,
  SummaryAthlete,
  UpdatableActivity,
} from "../models/index";
import {
  ActivityZoneFromJSON,
  ActivityZoneToJSON,
  CommentFromJSON,
  CommentToJSON,
  DetailedActivityFromJSON,
  DetailedActivityToJSON,
  FaultFromJSON,
  FaultToJSON,
  LapFromJSON,
  LapToJSON,
  SummaryActivityFromJSON,
  SummaryActivityToJSON,
  SummaryAthleteFromJSON,
  SummaryAthleteToJSON,
  UpdatableActivityFromJSON,
  UpdatableActivityToJSON,
} from "../models/index";

export interface CreateActivityRequest {
  name: string;
  sportType: string;
  startDateLocal: Date;
  elapsedTime: number;
  type?: string;
  description?: string;
  distance?: number;
  trainer?: number;
  commute?: number;
}

export interface GetActivityByIdRequest {
  id: number;
  includeAllEfforts?: boolean;
}

export interface GetCommentsByActivityIdRequest {
  id: number;
  page?: number;
  perPage?: number;
  pageSize?: number;
  afterCursor?: string;
}

export interface GetKudoersByActivityIdRequest {
  id: number;
  page?: number;
  perPage?: number;
}

export interface GetLapsByActivityIdRequest {
  id: number;
}

export interface GetLoggedInAthleteActivitiesRequest {
  before?: number;
  after?: number;
  page?: number;
  perPage?: number;
}

export interface GetZonesByActivityIdRequest {
  id: number;
}

export interface UpdateActivityByIdRequest {
  id: number;
  body?: UpdatableActivity;
}

/**
 *
 */
export class ActivitiesApi extends runtime.BaseAPI {
  /**
   * Creates a manual activity for an athlete, requires activity:write scope.
   * Create an Activity
   */
  async createActivityRaw(
    requestParameters: CreateActivityRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<DetailedActivity>> {
    if (requestParameters["name"] == null) {
      throw new runtime.RequiredError(
        "name",
        'Required parameter "name" was null or undefined when calling createActivity().',
      );
    }

    if (requestParameters["sportType"] == null) {
      throw new runtime.RequiredError(
        "sportType",
        'Required parameter "sportType" was null or undefined when calling createActivity().',
      );
    }

    if (requestParameters["startDateLocal"] == null) {
      throw new runtime.RequiredError(
        "startDateLocal",
        'Required parameter "startDateLocal" was null or undefined when calling createActivity().',
      );
    }

    if (requestParameters["elapsedTime"] == null) {
      throw new runtime.RequiredError(
        "elapsedTime",
        'Required parameter "elapsedTime" was null or undefined when calling createActivity().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      // oauth required
      headerParameters["Authorization"] = await this.configuration.accessToken(
        "strava_oauth",
        [],
      );
    }

    const consumes: runtime.Consume[] = [
      { contentType: "multipart/form-data" },
    ];
    // @ts-ignore: canConsumeForm may be unused
    const canConsumeForm = runtime.canConsumeForm(consumes);

    let formParams: { append(param: string, value: any): any };
    let useForm = false;
    if (useForm) {
      formParams = new FormData();
    } else {
      formParams = new URLSearchParams();
    }

    if (requestParameters["name"] != null) {
      formParams.append("name", requestParameters["name"] as any);
    }

    if (requestParameters["type"] != null) {
      formParams.append("type", requestParameters["type"] as any);
    }

    if (requestParameters["sportType"] != null) {
      formParams.append("sport_type", requestParameters["sportType"] as any);
    }

    if (requestParameters["startDateLocal"] != null) {
      formParams.append(
        "start_date_local",
        (requestParameters["startDateLocal"] as any).toISOString(),
      );
    }

    if (requestParameters["elapsedTime"] != null) {
      formParams.append(
        "elapsed_time",
        requestParameters["elapsedTime"] as any,
      );
    }

    if (requestParameters["description"] != null) {
      formParams.append("description", requestParameters["description"] as any);
    }

    if (requestParameters["distance"] != null) {
      formParams.append("distance", requestParameters["distance"] as any);
    }

    if (requestParameters["trainer"] != null) {
      formParams.append("trainer", requestParameters["trainer"] as any);
    }

    if (requestParameters["commute"] != null) {
      formParams.append("commute", requestParameters["commute"] as any);
    }

    const response = await this.request(
      {
        path: `/activities`,
        method: "POST",
        headers: headerParameters,
        query: queryParameters,
        body: formParams,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      DetailedActivityFromJSON(jsonValue),
    );
  }

  /**
   * Creates a manual activity for an athlete, requires activity:write scope.
   * Create an Activity
   */
  async createActivity(
    requestParameters: CreateActivityRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<DetailedActivity> {
    const response = await this.createActivityRaw(
      requestParameters,
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Returns the given activity that is owned by the authenticated athlete. Requires activity:read for Everyone and Followers activities. Requires activity:read_all for Only Me activities.
   * Get Activity
   */
  async getActivityByIdRaw(
    requestParameters: GetActivityByIdRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<DetailedActivity>> {
    if (requestParameters["id"] == null) {
      throw new runtime.RequiredError(
        "id",
        'Required parameter "id" was null or undefined when calling getActivityById().',
      );
    }

    const queryParameters: any = {};

    if (requestParameters["includeAllEfforts"] != null) {
      queryParameters["include_all_efforts"] =
        requestParameters["includeAllEfforts"];
    }

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      // oauth required
      headerParameters["Authorization"] = await this.configuration.accessToken(
        "strava_oauth",
        [],
      );
    }

    const response = await this.request(
      {
        path: `/activities/{id}`.replace(
          `{${"id"}}`,
          encodeURIComponent(String(requestParameters["id"])),
        ),
        method: "GET",
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      DetailedActivityFromJSON(jsonValue),
    );
  }

  /**
   * Returns the given activity that is owned by the authenticated athlete. Requires activity:read for Everyone and Followers activities. Requires activity:read_all for Only Me activities.
   * Get Activity
   */
  async getActivityById(
    requestParameters: GetActivityByIdRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<DetailedActivity> {
    const response = await this.getActivityByIdRaw(
      requestParameters,
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Returns the comments on the given activity. Requires activity:read for Everyone and Followers activities. Requires activity:read_all for Only Me activities.
   * List Activity Comments
   */
  async getCommentsByActivityIdRaw(
    requestParameters: GetCommentsByActivityIdRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<Array<Comment>>> {
    if (requestParameters["id"] == null) {
      throw new runtime.RequiredError(
        "id",
        'Required parameter "id" was null or undefined when calling getCommentsByActivityId().',
      );
    }

    const queryParameters: any = {};

    if (requestParameters["page"] != null) {
      queryParameters["page"] = requestParameters["page"];
    }

    if (requestParameters["perPage"] != null) {
      queryParameters["per_page"] = requestParameters["perPage"];
    }

    if (requestParameters["pageSize"] != null) {
      queryParameters["page_size"] = requestParameters["pageSize"];
    }

    if (requestParameters["afterCursor"] != null) {
      queryParameters["after_cursor"] = requestParameters["afterCursor"];
    }

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      // oauth required
      headerParameters["Authorization"] = await this.configuration.accessToken(
        "strava_oauth",
        [],
      );
    }

    const response = await this.request(
      {
        path: `/activities/{id}/comments`.replace(
          `{${"id"}}`,
          encodeURIComponent(String(requestParameters["id"])),
        ),
        method: "GET",
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      jsonValue.map(CommentFromJSON),
    );
  }

  /**
   * Returns the comments on the given activity. Requires activity:read for Everyone and Followers activities. Requires activity:read_all for Only Me activities.
   * List Activity Comments
   */
  async getCommentsByActivityId(
    requestParameters: GetCommentsByActivityIdRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<Array<Comment>> {
    const response = await this.getCommentsByActivityIdRaw(
      requestParameters,
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Returns the athletes who kudoed an activity identified by an identifier. Requires activity:read for Everyone and Followers activities. Requires activity:read_all for Only Me activities.
   * List Activity Kudoers
   */
  async getKudoersByActivityIdRaw(
    requestParameters: GetKudoersByActivityIdRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<Array<SummaryAthlete>>> {
    if (requestParameters["id"] == null) {
      throw new runtime.RequiredError(
        "id",
        'Required parameter "id" was null or undefined when calling getKudoersByActivityId().',
      );
    }

    const queryParameters: any = {};

    if (requestParameters["page"] != null) {
      queryParameters["page"] = requestParameters["page"];
    }

    if (requestParameters["perPage"] != null) {
      queryParameters["per_page"] = requestParameters["perPage"];
    }

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      // oauth required
      headerParameters["Authorization"] = await this.configuration.accessToken(
        "strava_oauth",
        [],
      );
    }

    const response = await this.request(
      {
        path: `/activities/{id}/kudos`.replace(
          `{${"id"}}`,
          encodeURIComponent(String(requestParameters["id"])),
        ),
        method: "GET",
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      jsonValue.map(SummaryAthleteFromJSON),
    );
  }

  /**
   * Returns the athletes who kudoed an activity identified by an identifier. Requires activity:read for Everyone and Followers activities. Requires activity:read_all for Only Me activities.
   * List Activity Kudoers
   */
  async getKudoersByActivityId(
    requestParameters: GetKudoersByActivityIdRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<Array<SummaryAthlete>> {
    const response = await this.getKudoersByActivityIdRaw(
      requestParameters,
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Returns the laps of an activity identified by an identifier. Requires activity:read for Everyone and Followers activities. Requires activity:read_all for Only Me activities.
   * List Activity Laps
   */
  async getLapsByActivityIdRaw(
    requestParameters: GetLapsByActivityIdRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<Array<Lap>>> {
    if (requestParameters["id"] == null) {
      throw new runtime.RequiredError(
        "id",
        'Required parameter "id" was null or undefined when calling getLapsByActivityId().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      // oauth required
      headerParameters["Authorization"] = await this.configuration.accessToken(
        "strava_oauth",
        [],
      );
    }

    const response = await this.request(
      {
        path: `/activities/{id}/laps`.replace(
          `{${"id"}}`,
          encodeURIComponent(String(requestParameters["id"])),
        ),
        method: "GET",
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      jsonValue.map(LapFromJSON),
    );
  }

  /**
   * Returns the laps of an activity identified by an identifier. Requires activity:read for Everyone and Followers activities. Requires activity:read_all for Only Me activities.
   * List Activity Laps
   */
  async getLapsByActivityId(
    requestParameters: GetLapsByActivityIdRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<Array<Lap>> {
    const response = await this.getLapsByActivityIdRaw(
      requestParameters,
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Returns the activities of an athlete for a specific identifier. Requires activity:read. Only Me activities will be filtered out unless requested by a token with activity:read_all.
   * List Athlete Activities
   */
  async getLoggedInAthleteActivitiesRaw(
    requestParameters: GetLoggedInAthleteActivitiesRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<Array<SummaryActivity>>> {
    const queryParameters: any = {};

    if (requestParameters["before"] != null) {
      queryParameters["before"] = requestParameters["before"];
    }

    if (requestParameters["after"] != null) {
      queryParameters["after"] = requestParameters["after"];
    }

    if (requestParameters["page"] != null) {
      queryParameters["page"] = requestParameters["page"];
    }

    if (requestParameters["perPage"] != null) {
      queryParameters["per_page"] = requestParameters["perPage"];
    }

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      // oauth required
      headerParameters["Authorization"] = await this.configuration.accessToken(
        "strava_oauth",
        [],
      );
    }

    const response = await this.request(
      {
        path: `/athlete/activities`,
        method: "GET",
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      jsonValue.map(SummaryActivityFromJSON),
    );
  }

  /**
   * Returns the activities of an athlete for a specific identifier. Requires activity:read. Only Me activities will be filtered out unless requested by a token with activity:read_all.
   * List Athlete Activities
   */
  async getLoggedInAthleteActivities(
    requestParameters: GetLoggedInAthleteActivitiesRequest = {},
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<Array<SummaryActivity>> {
    const response = await this.getLoggedInAthleteActivitiesRaw(
      requestParameters,
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Summit Feature. Returns the zones of a given activity. Requires activity:read for Everyone and Followers activities. Requires activity:read_all for Only Me activities.
   * Get Activity Zones
   */
  async getZonesByActivityIdRaw(
    requestParameters: GetZonesByActivityIdRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<Array<ActivityZone>>> {
    if (requestParameters["id"] == null) {
      throw new runtime.RequiredError(
        "id",
        'Required parameter "id" was null or undefined when calling getZonesByActivityId().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      // oauth required
      headerParameters["Authorization"] = await this.configuration.accessToken(
        "strava_oauth",
        [],
      );
    }

    const response = await this.request(
      {
        path: `/activities/{id}/zones`.replace(
          `{${"id"}}`,
          encodeURIComponent(String(requestParameters["id"])),
        ),
        method: "GET",
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      jsonValue.map(ActivityZoneFromJSON),
    );
  }

  /**
   * Summit Feature. Returns the zones of a given activity. Requires activity:read for Everyone and Followers activities. Requires activity:read_all for Only Me activities.
   * Get Activity Zones
   */
  async getZonesByActivityId(
    requestParameters: GetZonesByActivityIdRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<Array<ActivityZone>> {
    const response = await this.getZonesByActivityIdRaw(
      requestParameters,
      initOverrides,
    );
    return await response.value();
  }

  /**
   * Updates the given activity that is owned by the authenticated athlete. Requires activity:write. Also requires activity:read_all in order to update Only Me activities
   * Update Activity
   */
  async updateActivityByIdRaw(
    requestParameters: UpdateActivityByIdRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<runtime.ApiResponse<DetailedActivity>> {
    if (requestParameters["id"] == null) {
      throw new runtime.RequiredError(
        "id",
        'Required parameter "id" was null or undefined when calling updateActivityById().',
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters["Content-Type"] = "application/json";

    if (this.configuration && this.configuration.accessToken) {
      // oauth required
      headerParameters["Authorization"] = await this.configuration.accessToken(
        "strava_oauth",
        [],
      );
    }

    const response = await this.request(
      {
        path: `/activities/{id}`.replace(
          `{${"id"}}`,
          encodeURIComponent(String(requestParameters["id"])),
        ),
        method: "PUT",
        headers: headerParameters,
        query: queryParameters,
        body: UpdatableActivityToJSON(requestParameters["body"]),
      },
      initOverrides,
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      DetailedActivityFromJSON(jsonValue),
    );
  }

  /**
   * Updates the given activity that is owned by the authenticated athlete. Requires activity:write. Also requires activity:read_all in order to update Only Me activities
   * Update Activity
   */
  async updateActivityById(
    requestParameters: UpdateActivityByIdRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction,
  ): Promise<DetailedActivity> {
    const response = await this.updateActivityByIdRaw(
      requestParameters,
      initOverrides,
    );
    return await response.value();
  }
}