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
import type { ActivityType } from "./ActivityType";
import {
  ActivityTypeFromJSON,
  ActivityTypeFromJSONTyped,
  ActivityTypeToJSON,
} from "./ActivityType";
import type { SportType } from "./SportType";
import {
  SportTypeFromJSON,
  SportTypeFromJSONTyped,
  SportTypeToJSON,
} from "./SportType";

/**
 *
 * @export
 * @interface UpdatableActivity
 */
export interface UpdatableActivity {
  /**
   * Whether this activity is a commute
   * @type {boolean}
   * @memberof UpdatableActivity
   */
  commute?: boolean;
  /**
   * Whether this activity was recorded on a training machine
   * @type {boolean}
   * @memberof UpdatableActivity
   */
  trainer?: boolean;
  /**
   * Whether this activity is muted
   * @type {boolean}
   * @memberof UpdatableActivity
   */
  hideFromHome?: boolean;
  /**
   * The description of the activity
   * @type {string}
   * @memberof UpdatableActivity
   */
  description?: string;
  /**
   * The name of the activity
   * @type {string}
   * @memberof UpdatableActivity
   */
  name?: string;
  /**
   *
   * @type {ActivityType}
   * @memberof UpdatableActivity
   */
  type?: ActivityType;
  /**
   *
   * @type {SportType}
   * @memberof UpdatableActivity
   */
  sportType?: SportType;
  /**
   * Identifier for the gear associated with the activity. ‘none’ clears gear from activity
   * @type {string}
   * @memberof UpdatableActivity
   */
  gearId?: string;
}

/**
 * Check if a given object implements the UpdatableActivity interface.
 */
export function instanceOfUpdatableActivity(value: object): boolean {
  let isInstance = true;

  return isInstance;
}

export function UpdatableActivityFromJSON(json: any): UpdatableActivity {
  return UpdatableActivityFromJSONTyped(json, false);
}

export function UpdatableActivityFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean,
): UpdatableActivity {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    commute: !exists(json, "commute") ? undefined : json["commute"],
    trainer: !exists(json, "trainer") ? undefined : json["trainer"],
    hideFromHome: !exists(json, "hide_from_home")
      ? undefined
      : json["hide_from_home"],
    description: !exists(json, "description") ? undefined : json["description"],
    name: !exists(json, "name") ? undefined : json["name"],
    type: !exists(json, "type")
      ? undefined
      : ActivityTypeFromJSON(json["type"]),
    sportType: !exists(json, "sport_type")
      ? undefined
      : SportTypeFromJSON(json["sport_type"]),
    gearId: !exists(json, "gear_id") ? undefined : json["gear_id"],
  };
}

export function UpdatableActivityToJSON(value?: UpdatableActivity | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    commute: value.commute,
    trainer: value.trainer,
    hide_from_home: value.hideFromHome,
    description: value.description,
    name: value.name,
    type: ActivityTypeToJSON(value.type),
    sport_type: SportTypeToJSON(value.sportType),
    gear_id: value.gearId,
  };
}