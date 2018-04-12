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

// Major polyfills go here (Missing features, etc)
import 'babel-polyfill/dist/polyfill';

import * as Widgets from "./Widgets/Widgets";
import * as Effects from "./Effects";
// Do any prime polyfill imports here for backwards compatibility
import {DataQueue} from "./DataQueue";
import {PrimeRequest} from "./PrimeRequest";

export {Browser} from "./Browser";
export {Effects};
export {Events} from "./Events";
export {PrimeDate as Date} from "./Date";
export {PrimeDocument as Document} from "./PrimeDocument";
export {PrimeStorage as Storage} from "./Storage";
export {PrimeWindow as Window} from "./Window";
export {Template} from "./Template";
export {Utils} from "./Utils";
export {Widgets};

const Ajax = {
  Request: PrimeRequest
};

const Data = {
  Queue: DataQueue
};

export {Ajax};
export {Data};
