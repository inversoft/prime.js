/*
 * Copyright (c) 2017, Inversoft Inc., All Rights Reserved
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

import * as Widgets from "./Widgets/Widgets.js"
import * as Effects from "./Effects.js"
// Do any polyfill imports here for backwards compatibility
import {DataQueue} from "./DataQueue.js";
import {PrimeRequest} from "./PrimeRequest.js";

export {Browser} from "./Browser.js"
export {Effects}
export {Events} from "./Events.js"
export {PrimeDate as Date} from "./Date.js"
export {PrimeDocument as Document} from "./PrimeDocument.js"
export {PrimeStorage as Storage} from "./Storage.js"
export {PrimeWindow as Window} from "./Window.js"
export {Template} from "./Template.js"
export {Utils} from "./Utils.js"
export {Widgets}

const Ajax = {
  Request: PrimeRequest
};

const Data = {
  Queue: DataQueue
};

export {Ajax}
export {Data}
