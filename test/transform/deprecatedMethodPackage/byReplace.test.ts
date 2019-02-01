
import { InMemoryProject, NoParameters } from "@atomist/automation-client";
import { PushAwareParametersInvocation } from "@atomist/sdm";
import * as assert from "assert";
import {
    replaceGuavaMethodWithStandard,
} from "../../../lib/transform/deprecatedMethodPackage/byReplace";
import * as javaFile from "../../../lib/transform/java";

const JavaFilename = "src/main/java/com/undeprecate/UseDeprecatedMethod.java";
const JavaFileCallingMethodInOldPackage = `package com.jessitron.hg.undeprecate;

import com.google.common.collect.Iterators;
import java.util.Iterator;

public class UseDeprecatedIterators {

    public void doStuff() {
        Iterator<String> it = Iterators.emptyIterator();
    }
}
`;

const fakePapi: PushAwareParametersInvocation<NoParameters> = {} as any;

describe("Changes a call to a Guava method to the new standard one in Java Collections", () => {
    it("changes the old package to the new one", async () => {
        const input = InMemoryProject.of({ path: JavaFilename, content: JavaFileCallingMethodInOldPackage });

        await replaceGuavaMethodWithStandard()(input, fakePapi);

        const file = input.findFileSync(JavaFilename);
        const newContent = file.getContentSync();

        assert(!newContent.includes("Iterators.emptyIterator"), "replace old method");
        assert(newContent.includes("Collections.emptyIterator"), "with new method");
        assert(javaFile.hasImport("java.util.Collections",
            file), "have new import");
        assert(!javaFile.hasImport("com.google.common.collect.Iterators",
            file), "not old import");

    });
});
