import { Java9FileParser } from "@atomist/antlr";
import { astUtils, NoParameters, Project } from "@atomist/automation-client";
import { CodeTransform, PushAwareParametersInvocation } from "@atomist/sdm";
import _ = require("lodash");

export function noticeAllMethodCalls(): CodeTransform {
    return async (project: Project, papi: PushAwareParametersInvocation<NoParameters>) => {
        const matchIterable = await astUtils.matchIterator(project, {
            parseWith: Java9FileParser,
            globPatterns: "**/*.java",
            pathExpression: `/compilationUnit//methodInvocation_lfno_primary/identifier/Identifier`,
        });

        const words: { [k: string]: number } = {};
        for await (const m of matchIterable) {
            const methodCall = m.$value || "";
            words[methodCall] = (words[methodCall] || 0) + 1;
        }

        const allMethodCallsEverywhere = Object.entries(words).map(([k, v]) => `${k}: ${v}`);

        papi.addressChannels("Look at all these methods!!\n" + allMethodCallsEverywhere.join("\n"));

    };
}
