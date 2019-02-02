import { InMemoryProject } from "@atomist/automation-client";
import * as assert from "assert";
import * as javaFile from "../../../lib/transform/java";

const JavaFilename = "src/main/java/com/jessitron/HappyCow.java";
const JavaContent = `package com.jessitron;

import existing.imported.Thinger;
import existing.imported.dotStar.*;

class HappyCow {}
`;

describe("removing an import", () => {
    it("does nothing if it is not there", async () => {
        const p = InMemoryProject.of({ path: JavaFilename, content: JavaContent });

        await javaFile.removeImport("notExisting.imported.Stuff", p, JavaFilename);

        const newContent = p.findFileSync(JavaFilename).getContentSync();

        assert.strictEqual(newContent, JavaContent, "This should change nothing");
    });

    it("removes an import that it has", async () => {
        const p = InMemoryProject.of({ path: JavaFilename, content: JavaContent });

        await javaFile.removeImport("existing.imported.Thinger", p, JavaFilename);

        const newContent = p.findFileSync(JavaFilename).getContentSync();

        assert(!newContent.includes("import existing.imported.Thinger;"),
            "make it go away");
    });
});
