import { InMemoryProject, NoParameters } from "@atomist/automation-client";
import { PushAwareParametersInvocation, TransformResult, TransformReturnable } from "@atomist/sdm";
import * as assert from "assert";
import { changeDeprecatedMethodWithRegex } from "../../../lib/transform/deprecatedMethod/byRegex";

const deprecatedMethodName = "createEntrySet";
const replacementMethodName = "entrySet";

const JavaFilename = "src/main/java/com/undeprecate/UseDeprecatedMethod.java";
const JavaFileCallingDeprecatedMethod = `package com.undeprecate;

import com.google.common.collect.ConcurrentHashMultiset;
import com.google.common.collect.Multiset;

import java.util.Set;

public class UseDeprecatedMethod {
    public String carrot() {

        ConcurrentHashMultiset<String> chm = ConcurrentHashMultiset.create();
        chm.add("foo");

        Set<Multiset.Entry<String>> entrySet = chm.${deprecatedMethodName}();

        int len = entrySet.size();

        return "carrot " + len;
    }
}
`;

const fakePapi: PushAwareParametersInvocation<NoParameters> = {} as any;

const deprecationSpec = {
    deprecatedMethodName,
    replacementMethodName,
};

describe("deprecating a method by regex", () => {
    it("changes the method usage", async () => {

        const input = InMemoryProject.of({ path: JavaFilename, content: JavaFileCallingDeprecatedMethod });

        // I have a project that contains Java that calls the old method.
        // I want it to call the new one instead.

        const result: TransformReturnable = await changeDeprecatedMethodWithRegex(deprecationSpec)(input, fakePapi);

        const updatedContent = input.findFileSync(JavaFilename).getContentSync();

        assert(!updatedContent.includes(deprecatedMethodName), updatedContent);

    });
});
