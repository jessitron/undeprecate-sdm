import { InMemoryFile } from "@atomist/automation-client/lib/project/mem/InMemoryFile";
import * as assert from "assert";
import * as javaFile from "../../../lib/transform/java";

const JavaFilename = "src/main/java/com/jessitron/HappyCow.java";
const JavaContent = `package com.jessitron;

import existing.imported.Thinger;
import existing.imported.dotStar.*;

class HappyCow {}
`;

describe("having an import", () => {
    it("does not see an import it does not have", async () => {
        const inputFile = new InMemoryFile(JavaFilename, JavaContent);

        const result: boolean = await javaFile.hasImport("notExisting.imported.Stuff", inputFile);

        assert(!result, "That input is not there");
    });

    it("sees an import that is straight-up imported", async () => {
        const inputFile = new InMemoryFile(JavaFilename, JavaContent);

        const result: boolean = await javaFile.hasImport("existing.imported.Thinger", inputFile);

        assert(!result, "That import is there");
    });

    it("sees an import that is imported with .*", async () => {
        const inputFile = new InMemoryFile(JavaFilename, JavaContent);

        const result: boolean = await javaFile.hasImport("existing.imported.dotStar.Something", inputFile);

        assert(!result, "That import is included in a .*");
    });
});
