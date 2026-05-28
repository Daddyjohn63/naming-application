/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai_naming from "../ai/naming.js";
import type * as catProfile from "../catProfile.js";
import type * as catProfileActions from "../catProfileActions.js";
import type * as catSummary from "../catSummary.js";
import type * as catSummaryActions from "../catSummaryActions.js";
import type * as cats from "../cats.js";
import type * as familyNaming from "../familyNaming.js";
import type * as familyNamingActions from "../familyNamingActions.js";
import type * as http from "../http.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "ai/naming": typeof ai_naming;
  catProfile: typeof catProfile;
  catProfileActions: typeof catProfileActions;
  catSummary: typeof catSummary;
  catSummaryActions: typeof catSummaryActions;
  cats: typeof cats;
  familyNaming: typeof familyNaming;
  familyNamingActions: typeof familyNamingActions;
  http: typeof http;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
