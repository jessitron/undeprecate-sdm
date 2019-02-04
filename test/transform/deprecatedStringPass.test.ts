
import { InMemoryProject, NoParameters } from "@atomist/automation-client";
import { PushAwareParametersInvocation } from "@atomist/sdm";
import * as assert from "assert";
import * as javaFile from "../../lib/transform/java";
import { writeBytesWithBytes } from "../../lib/transform/writeBytesWithBytes";

const JavaFilename = "src/main/java/com/jessitron/CallWriteBytes.java";
const JavaContent = `package com.jessitron.hg.undeprecate;

import com.google.common.io.ByteArrayDataOutput;
import com.google.common.io.ByteStreams;

public class CallWriteBytes {

    public void doStuff() {
        ByteArrayDataOutput op = ByteStreams.newDataOutput();

        op.writeBytes(
            "I am the string of danger");
    }
}`;

const JavaContentWithStringVariable = `package com.jessitron.hg.undeprecate;

import com.google.common.io.ByteArrayDataOutput;
import com.google.common.io.ByteStreams;

public class CallWriteBytes {
    public void doStuff() {
        ByteArrayDataOutput op = ByteStreams.newDataOutput();
        String foolark = "I am also evil and treacherous";
        op.writeBytes(foolark);
    }
}`;
const fakePapi: PushAwareParametersInvocation<NoParameters> = { addressChannels() { } } as any;

describe("change how you pass a string to writeBytes", () => {
    it("should call getBytes on the string", async () => {
        const p = InMemoryProject.of({ path: JavaFilename, content: JavaContent });

        const result = await writeBytesWithBytes()(p, fakePapi);
        const newContent = p.findFileSync(JavaFilename).getContentSync();

        assert(newContent.includes(`op.writeBytes(
            "I am the string of danger".getBytes(Charsets.UTF_8))`), newContent); // i don't really care about the whitespace
        assert(javaFile.hasImport("com.google.common.base.Charsets", p, JavaFilename));
        assert(!newContent.includes("writeBytes"), "This should call write instead of writeBytes\n" + newContent);
    });

    it("should call getBytes on a string var", async () => {
        const p = InMemoryProject.of({ path: JavaFilename, content: JavaContentWithStringVariable });

        const result = await writeBytesWithBytes()(p, fakePapi);
        const newContent = p.findFileSync(JavaFilename).getContentSync();

        assert(newContent.includes(`write(foolark.getBytes(Charsets.UTF_8))`));
        assert(javaFile.hasImport("com.google.common.base.Charsets", p, JavaFilename));
        assert(!newContent.includes("writeBytes"), "This should call write instead of writeBytes");

    });

});
