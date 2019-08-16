/*
 * Copyright (c) 2019, Inversoft Inc., All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific
 * language governing permissions and limitations under the License.
 */

import * as widgets from "./Widgets/Widgets.js"
import * as effects from "./Effects.js"
import * as utils from "./Utils"
// Do any polyfill imports here for backwards compatibility
import {DataQueue} from "./DataQueue";
import {PrimeRequest} from "./PrimeRequest";

import {Browser as browser} from "./Browser"
import {Events as events} from "./Events"
import {PrimeDate} from "./Date"
import {PrimeStorage as storage} from "./Storage"
import {PrimeWindow as window} from "./Window"
import {Template as template} from "./Template"

export namespace Prime {
  export namespace Ajax {
    export type Request = PrimeRequest
  }

  namespace Data {
    export type Queue = DataQueue
  }

  export const Browser = browser;
  export const Events = events;
  export const Date = PrimeDate;
  export const PrimeDocument = document;
  export const PrimeStorage = storage;
  export const Window = window;
  export const Template = template;
  export const Effects = effects;
  export const Utils = utils;
  export const Widgets = widgets;
}
