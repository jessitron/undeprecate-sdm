
import { InMemoryProject, NoParameters } from "@atomist/automation-client";
import { PushAwareParametersInvocation } from "@atomist/sdm";
import * as assert from "assert";
import {
    mightUse,
    replaceGuavaMethodWithStandard,
} from "../../../lib/transform/deprecatedMethodPackage/replaceGuavaMethod";
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

const JavaFileCallingTwoMethodsInOldPackage = `package com.jessitron.hg.undeprecate;

import com.google.common.collect.Iterators;
import java.util.Iterator;

public class UseDeprecatedIterators {

    public void doStuff() {
        Iterator<String> it = Iterators.emptyIterator();

        Iterator<Integer> other = Iterators.cycle(1,2,3);
    }
}
`;

const JavaFileWithStaticImport = `package com.jessitron.hg.undeprecate;

import static com.google.common.collect.Iterators.emptyIterator;

import java.util.Iterator;

public class UseDeprecatedIteratorsWithStaticImport {

    public void doStuff() {
        Iterator<String> it = emptyIterator();
    }
}`;

const fakePapi: PushAwareParametersInvocation<NoParameters> = {} as any;

describe("Changes a call to a Guava method to the new standard one in Java Collections", () => {

    it("changes the old package to the new one", async () => {
        const inputProject = InMemoryProject.of({ path: JavaFilename, content: JavaFileCallingMethodInOldPackage });

        await replaceGuavaMethodWithStandard()(inputProject, fakePapi);

        const file = inputProject.findFileSync(JavaFilename);
        const newContent = file.getContentSync();

        assert(!newContent.includes("Iterators.emptyIterator"), "replace old method");
        assert(newContent.includes("Collections.emptyIterator"), "with new method");
        assert(await javaFile.hasImport("java.util.Collections", inputProject, JavaFilename),
            "have new import");
        assert(!(await javaFile.hasImport("com.google.common.collect.Iterators", inputProject, JavaFilename)),
            "old import is still there: " + newContent);
    });

    it("leaves the old import if it's used elsewhere", async () => {
        const inputProject = InMemoryProject.of({ path: JavaFilename, content: JavaFileCallingTwoMethodsInOldPackage });

        await replaceGuavaMethodWithStandard()(inputProject, fakePapi);

        const file = inputProject.findFileSync(JavaFilename);
        const newContent = file.getContentSync();

        assert(newContent.includes("com.google.common.collect.Iterators"),
            newContent);
        assert((await javaFile.hasImport("com.google.common.collect.Iterators", inputProject, JavaFilename)),
            "old import should remain: " + newContent);
    });

    it("changes a static import", async () => {
        const inputProject = InMemoryProject.of({ path: JavaFilename, content: JavaFileWithStaticImport });

        await replaceGuavaMethodWithStandard()(inputProject, fakePapi);

        const file = inputProject.findFileSync(JavaFilename);
        const newContent = file.getContentSync();

        assert(await javaFile.hasStaticImport("java.util.Collections.emptyIterator", inputProject, JavaFilename),
            "have new import. Has: " + newContent);
        assert(!(await javaFile.hasStaticImport("com.google.common.collect.Iterators.emptyIterator", inputProject, JavaFilename)),
            "old import is still there: " + newContent);
    });
});

describe("might use", () => {

    it("says no with no use", async () => {
        assert(!mightUse("com.foo.bar.Baz", ""));
    });

    it("says yes with use in whole word", async () => {
        assert(mightUse("com.foo.bar.Baz", "Baz"));
    });

    it("says no with partial use", async () => {
        assert(!mightUse("com.foo.bar.Baz", "Bazrich"));
    });

});
