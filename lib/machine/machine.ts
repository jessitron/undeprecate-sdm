/*
 * Copyright © 2018 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
    CommandListenerInvocation,
    SoftwareDeliveryMachine,
    SoftwareDeliveryMachineConfiguration,
    TransformResult,
} from "@atomist/sdm";
import {
    createSoftwareDeliveryMachine,
} from "@atomist/sdm-core";
import { changeDeprecatedMethodWithAST } from "../transform/deprecatedMethod/byMethodCall";
import { changeDeprecatedMethodWithReplace } from "../transform/deprecatedMethod/byReplace";
import { replaceGuavaMethodWithStandard } from "../transform/deprecatedMethodPackage/byReplace";
import { actualGoodUsefulReactionToTransformResults } from "../transform/onTransformResult";

/**
 * Initialize an sdm definition, and add functionality to it.
 *
 * @param configuration All the configuration for this service
 */
export function machine(
    configuration: SoftwareDeliveryMachineConfiguration,
): SoftwareDeliveryMachine {

    const sdm = createSoftwareDeliveryMachine({
        name: "Undeprecating SDM",
        configuration,
    });

    sdm.addCodeTransformCommand({
        name: "change deprecated usage by replace",
        intent: "undeprecate1",
        transform: changeDeprecatedMethodWithReplace({
            deprecatedMethodName: "createEntrySet",
            replacementMethodName: "entrySet",
        }),
        onTransformResults: actualGoodUsefulReactionToTransformResults,
    });

    sdm.addCodeTransformCommand({
        name: "change deprecated usage by AST",
        intent: "undeprecate2",
        transform: changeDeprecatedMethodWithAST({
            deprecatedMethodName: "createEntrySet",
            replacementMethodName: "entrySet",
        }),
        onTransformResults: actualGoodUsefulReactionToTransformResults,
    });

    sdm.addCodeTransformCommand({
        name: "undeprecate emptyIterator",
        description: "change deprecated emptyIterator to modern one",
        intent: "update emptyIterator",
        transform: replaceGuavaMethodWithStandard(),
        onTransformResults: actualGoodUsefulReactionToTransformResults,
    });

    /*
     * this is a good place to type
    sdm.
     * and see what the IDE suggests for after the dot
     */

    return sdm;
}
