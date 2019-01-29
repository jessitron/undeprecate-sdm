import * as assert from "assert";
import { InMemoryProject } from "@atomist/automation-client";
import { changeDeprecatedMethodWithRegex } from "../../../lib/transform/deprecatedMethod/byRegex";

const deprecatedMethodName = "createEntrySet";

const JavaFilename = "src/main/java/com/undeprecate/UseDeprecatedMethod.java"
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

describe("deprecating a method by regex", () => {
    it("changes the method usage", async () => {

        const input = InMemoryProject.of({ path: JavaFilename, content: JavaFileCallingDeprecatedMethod })

        // I have a project that contains Java that calls the old method.
        // I want it to call the new one instead.

        const result = changeDeprecatedMethodWithRegex({})(input, undefined);

        const updatedContent = input.findFileSync(JavaFilename).getContentSync();

        assert(!updatedContent.includes(deprecatedMethodName), updatedContent);

    });
});