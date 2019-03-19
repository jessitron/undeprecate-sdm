import { InMemoryProject } from "@atomist/automation-client";
import * as assert from "assert";
import { lookAtAnnotationParameters } from "../../lib/annotationParameters/inspection";

const usefulJava = `
package com.jessitron.hg;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(exclude = {}, excludeName = { "exclude" })
public class HorseguardsApplication {

	public static void main(String[] args) {
		SpringApplication.run(HorseguardsApplication.class, args);
	}
}
`;
const realisticName = "src/main/com/jessitron/hg/HorseguardsApplication.java";

describe("the annotation parameters inspection", () => {
    it("finds no results if the annotation doesn't exist", async () => {
        const input = InMemoryProject.of({ path: realisticName, content: usefulJava });
        const result = await
            lookAtAnnotationParameters({ annotationName: "NotHere" })(input, {} as any);
        assert.strictEqual(result.comments.length, 0);
    });

    it("finds a result for an annotation that exists", async () => {
        const input = InMemoryProject.of({ path: realisticName, content: usefulJava });
        const result = await
            lookAtAnnotationParameters({ annotationName: "SpringBootApplication" })(input, {} as any);
        assert.strictEqual(result.comments.length, 1);
        assert.strictEqual(result.comments[0].detail, `exclude = {}, excludeName = { "exclude" }`);
    });
});
