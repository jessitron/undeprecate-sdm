import { EditMode } from "@atomist/automation-client";
import { isBranchCommit, isPullRequest } from "@atomist/automation-client/lib/operations/edit/editModes";
import { CommandListenerInvocation, TransformResult } from "@atomist/sdm";
import { Attachment, Field, SlackMessage } from "@atomist/slack-messages";

export async function actualGoodUsefulReactionToTransformResults(
    trs: TransformResult[],
    cli: CommandListenerInvocation): Promise<void> {

    const attachments: Attachment[] = trs.map(tr => {
        const projectId = tr.target.id;

        const common: Partial<Attachment> = {
            author_name: `${projectId.owner}/${projectId.repo}`,
            author_link: tr.target.id.url,
        };

        if (tr.error) {
            return {
                ...common,
                color: "#f00000",
                fallback: "failed transform result",
                mrkdwn_in: ["text"],
                title: "ERROR",
                text: "```\n" + tr.error.message + "\n```",
            };
        }
        if (tr.edited) {
            return {
                ...common,
                fallback: "successful transform result",
                color: "#20a010",
                fields: fromEditMode(tr.editMode),
            };
        }
        // it did nothing
        return {
            ...common,
            fallback: "no changes to make",
            text: "No changes made",
        };
    });

    const message: SlackMessage = {
        text: "Results of running *" + cli.commandName + "*:",
        attachments,
    };

    return cli.addressChannels(message);
}

function fromEditMode(editMode?: EditMode): Field[] {
    if (!editMode) {
        return [];
    }
    const fields: Field[] = [];
    if (isBranchCommit(editMode)) {
        fields.push({
            title: "branch",
            value: editMode.branch,
            short: false,
        });
    }
    if (isPullRequest(editMode)) {
        fields.push({
            title: "Pull Request title",
            value: editMode.title,
            short: false,
        });
        if (!!editMode.targetBranch) {
            fields.push({
                title: "target branch",
                value: editMode.targetBranch,
                short: false,
            });
        }
        if (!!editMode.autoMerge) {
            fields.push({
                title: "AutoMerge mode",
                value: editMode.autoMerge.mode,
                short: false,
            });
            if (!!editMode.autoMerge.method) {
                fields.push({
                    title: "AutoMerge method",
                    value: editMode.autoMerge.method,
                    short: false,
                });
            }
        }
    }
    return fields;
}
