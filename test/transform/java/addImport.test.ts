import { InMemoryProject } from "@atomist/automation-client";
import { InMemoryFile } from "@atomist/automation-client/lib/project/mem/InMemoryFile";
import * as assert from "assert";
import * as javaFile from "../../../lib/transform/java";

const JavaFilename = "src/main/java/com/jessitron/HappyCow.java";
const JavaContent = `package com.jessitron;

import existing.imported.Thinger;
import existing.imported.dotStar.*;

class HappyCow {}
`;

describe("adding an import", () => {
    it("adds an import that is missing", async () => {
        const p = InMemoryProject.of({ path: JavaFilename, content: JavaContent });

        await javaFile.addImport("notExisting.imported.Stuff", p, JavaFilename);

        const newContent = p.findFileSync(JavaFilename).getContentSync();

        assert(newContent.includes(`import notExisting.imported.Stuff;`),
            "where is the import of notExisting.imported.Stuff? found\n" + newContent);
        assert.strictEqual(countOccurrences(`import notExisting.imported.Stuff;`, newContent), 1, "Too many times!");
    });

    it("does not add an import that exists", async () => {
        const p = InMemoryProject.of({ path: JavaFilename, content: JavaContent });

        await javaFile.addImport("existing.imported.Thinger", p, JavaFilename);

        const newContent = p.findFileSync(JavaFilename).getContentSync();

        assert.strictEqual(newContent, JavaContent,
            "added a duplicate import?");
    });

    it("does not add an import that is imported with .*", async () => {
        const p = InMemoryProject.of({ path: JavaFilename, content: JavaContent });

        await javaFile.addImport("existing.imported.dotStar.Something", p, JavaFilename);

        const newContent = p.findFileSync(JavaFilename).getContentSync();

        assert.strictEqual(newContent, JavaContent,
            "that should have fallen within the .*");
    });
});

function countOccurrences(ofString: string, inString: string): number {
    return inString.split(ofString).length - 1;
}
