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
import type * as catWorldNaming from "../catWorldNaming.js";
import type * as catWorldNamingActions from "../catWorldNamingActions.js";
import type * as cats from "../cats.js";
import type * as ceremonyUnlock from "../ceremonyUnlock.js";
import type * as familyNaming from "../familyNaming.js";
import type * as familyNamingActions from "../familyNamingActions.js";
import type * as http from "../http.js";
import type * as ineffableNaming from "../ineffableNaming.js";
import type * as ineffableNamingActions from "../ineffableNamingActions.js";
import type * as lib_namingStage from "../lib/namingStage.js";
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
  catWorldNaming: typeof catWorldNaming;
  catWorldNamingActions: typeof catWorldNamingActions;
  cats: typeof cats;
  ceremonyUnlock: typeof ceremonyUnlock;
  familyNaming: typeof familyNaming;
  familyNamingActions: typeof familyNamingActions;
  http: typeof http;
  ineffableNaming: typeof ineffableNaming;
  ineffableNamingActions: typeof ineffableNamingActions;
  "lib/namingStage": typeof lib_namingStage;
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
