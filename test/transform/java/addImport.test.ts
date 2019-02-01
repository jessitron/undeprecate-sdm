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
        const inputFile = new InMemoryFile(JavaFilename, JavaContent);

        await javaFile.addImport("notExisting.imported.Stuff", inputFile);

        const newContent = inputFile.getContentSync();

        assert(newContent.includes(`import notExisting.imported.Stuff;`),
            "where is the import of notExisting.imported.Stuff?");
    });

    it("does not add an import that exists", async () => {
        const inputFile = new InMemoryFile(JavaFilename, JavaContent);

        await javaFile.addImport("existing.imported.Thinger", inputFile);

        const newContent = inputFile.getContentSync();

        assert.strictEqual(newContent, JavaContent,
            "added a duplicate import?");
    });

    it("does not add an import that is imported with .*", async () => {
        const inputFile = new InMemoryFile(JavaFilename, JavaContent);

        await javaFile.addImport("existing.imported.dotStar.Something", inputFile);

        const newContent = inputFile.getContentSync();

        assert.strictEqual(newContent, JavaContent,
            "that should have fallen within the .*");
    });
});
