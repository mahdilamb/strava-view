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

import { exists, mapValues } from "../runtime";
import type { MetaActivity } from "./MetaActivity";
import {
  MetaActivityFromJSON,
  MetaActivityFromJSONTyped,
  MetaActivityToJSON,
} from "./MetaActivity";
import type { MetaAthlete } from "./MetaAthlete";
import {
  MetaAthleteFromJSON,
  MetaAthleteFromJSONTyped,
  MetaAthleteToJSON,
} from "./MetaAthlete";
import type { SummarySegment } from "./SummarySegment";
import {
  SummarySegmentFromJSON,
  SummarySegmentFromJSONTyped,
  SummarySegmentToJSON,
} from "./SummarySegment";

/**
 *
 * @export
 * @interface DetailedSegmentEffort
 */
export interface DetailedSegmentEffort {
  /**
   * The unique identifier of this effort
   * @type {number}
   * @memberof DetailedSegmentEffort
   */
  id?: number;
  /**
   * The unique identifier of the activity related to this effort
   * @type {number}
   * @memberof DetailedSegmentEffort
   */
  activityId?: number;
  /**
   * The effort's elapsed time
   * @type {number}
   * @memberof DetailedSegmentEffort
   */
  elapsedTime?: number;
  /**
   * The time at which the effort was started.
   * @type {Date}
   * @memberof DetailedSegmentEffort
   */
  startDate?: Date;
  /**
   * The time at which the effort was started in the local timezone.
   * @type {Date}
   * @memberof DetailedSegmentEffort
   */
  startDateLocal?: Date;
  /**
   * The effort's distance in meters
   * @type {number}
   * @memberof DetailedSegmentEffort
   */
  distance?: number;
  /**
   * Whether this effort is the current best on the leaderboard
   * @type {boolean}
   * @memberof DetailedSegmentEffort
   */
  isKom?: boolean;
  /**
   * The name of the segment on which this effort was performed
   * @type {string}
   * @memberof DetailedSegmentEffort
   */
  name?: string;
  /**
   *
   * @type {MetaActivity}
   * @memberof DetailedSegmentEffort
   */
  activity?: MetaActivity;
  /**
   *
   * @type {MetaAthlete}
   * @memberof DetailedSegmentEffort
   */
  athlete?: MetaAthlete;
  /**
   * The effort's moving time
   * @type {number}
   * @memberof DetailedSegmentEffort
   */
  movingTime?: number;
  /**
   * The start index of this effort in its activity's stream
   * @type {number}
   * @memberof DetailedSegmentEffort
   */
  startIndex?: number;
  /**
   * The end index of this effort in its activity's stream
   * @type {number}
   * @memberof DetailedSegmentEffort
   */
  endIndex?: number;
  /**
   * The effort's average cadence
   * @type {number}
   * @memberof DetailedSegmentEffort
   */
  averageCadence?: number;
  /**
   * The average wattage of this effort
   * @type {number}
   * @memberof DetailedSegmentEffort
   */
  averageWatts?: number;
  /**
   * For riding efforts, whether the wattage was reported by a dedicated recording device
   * @type {boolean}
   * @memberof DetailedSegmentEffort
   */
  deviceWatts?: boolean;
  /**
   * The heart heart rate of the athlete during this effort
   * @type {number}
   * @memberof DetailedSegmentEffort
   */
  averageHeartrate?: number;
  /**
   * The maximum heart rate of the athlete during this effort
   * @type {number}
   * @memberof DetailedSegmentEffort
   */
  maxHeartrate?: number;
  /**
   *
   * @type {SummarySegment}
   * @memberof DetailedSegmentEffort
   */
  segment?: SummarySegment;
  /**
   * The rank of the effort on the global leaderboard if it belongs in the top 10 at the time of upload
   * @type {number}
   * @memberof DetailedSegmentEffort
   */
  komRank?: number;
  /**
   * The rank of the effort on the athlete's leaderboard if it belongs in the top 3 at the time of upload
   * @type {number}
   * @memberof DetailedSegmentEffort
   */
  prRank?: number;
  /**
   * Whether this effort should be hidden when viewed within an activity
   * @type {boolean}
   * @memberof DetailedSegmentEffort
   */
  hidden?: boolean;
}

/**
 * Check if a given object implements the DetailedSegmentEffort interface.
 */
export function instanceOfDetailedSegmentEffort(value: object): boolean {
  let isInstance = true;

  return isInstance;
}

export function DetailedSegmentEffortFromJSON(
  json: any,
): DetailedSegmentEffort {
  return DetailedSegmentEffortFromJSONTyped(json, false);
}

export function DetailedSegmentEffortFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): DetailedSegmentEffort {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    id: !exists(json, "id") ? undefined : json["id"],
    activityId: !exists(json, "activity_id") ? undefined : json["activity_id"],
    elapsedTime: !exists(json, "elapsed_time")
      ? undefined
      : json["elapsed_time"],
    startDate: !exists(json, "start_date")
      ? undefined
      : new Date(json["start_date"]),
    startDateLocal: !exists(json, "start_date_local")
      ? undefined
      : new Date(json["start_date_local"]),
    distance: !exists(json, "distance") ? undefined : json["distance"],
    isKom: !exists(json, "is_kom") ? undefined : json["is_kom"],
    name: !exists(json, "name") ? undefined : json["name"],
    activity: !exists(json, "activity")
      ? undefined
      : MetaActivityFromJSON(json["activity"]),
    athlete: !exists(json, "athlete")
      ? undefined
      : MetaAthleteFromJSON(json["athlete"]),
    movingTime: !exists(json, "moving_time") ? undefined : json["moving_time"],
    startIndex: !exists(json, "start_index") ? undefined : json["start_index"],
    endIndex: !exists(json, "end_index") ? undefined : json["end_index"],
    averageCadence: !exists(json, "average_cadence")
      ? undefined
      : json["average_cadence"],
    averageWatts: !exists(json, "average_watts")
      ? undefined
      : json["average_watts"],
    deviceWatts: !exists(json, "device_watts")
      ? undefined
      : json["device_watts"],
    averageHeartrate: !exists(json, "average_heartrate")
      ? undefined
      : json["average_heartrate"],
    maxHeartrate: !exists(json, "max_heartrate")
      ? undefined
      : json["max_heartrate"],
    segment: !exists(json, "segment")
      ? undefined
      : SummarySegmentFromJSON(json["segment"]),
    komRank: !exists(json, "kom_rank") ? undefined : json["kom_rank"],
    prRank: !exists(json, "pr_rank") ? undefined : json["pr_rank"],
    hidden: !exists(json, "hidden") ? undefined : json["hidden"],
  };
}

export function DetailedSegmentEffortToJSON(
  value?: DetailedSegmentEffort | null,
): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    id: value.id,
    activity_id: value.activityId,
    elapsed_time: value.elapsedTime,
    start_date:
      value.startDate === undefined ? undefined : value.startDate.toISOString(),
    start_date_local:
      value.startDateLocal === undefined
        ? undefined
        : value.startDateLocal.toISOString(),
    distance: value.distance,
    is_kom: value.isKom,
    name: value.name,
    activity: MetaActivityToJSON(value.activity),
    athlete: MetaAthleteToJSON(value.athlete),
    moving_time: value.movingTime,
    start_index: value.startIndex,
    end_index: value.endIndex,
    average_cadence: value.averageCadence,
    average_watts: value.averageWatts,
    device_watts: value.deviceWatts,
    average_heartrate: value.averageHeartrate,
    max_heartrate: value.maxHeartrate,
    segment: SummarySegmentToJSON(value.segment),
    kom_rank: value.komRank,
    pr_rank: value.prRank,
    hidden: value.hidden,
  };
}