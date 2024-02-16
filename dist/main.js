"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const inputHelper = __importStar(require("./core/input-helper"));
const branchHelper = __importStar(require("./core/branch-helper"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const secToken = core.getInput('secToken', {
                required: true,
                trimWhitespace: true,
            });
            const octokit = github.getOctokit(secToken);
            const { owner: targetOwner, repo: targetRepo } = github.context.repo;
            const defaultBranch = yield octokit.rest.repos.get({
                owner: targetOwner,
                repo: targetRepo,
                headers: {
                    accept: 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28',
                },
            });
            core.info(`default branch:${defaultBranch.data.default_branch}`);
            const inputs = yield inputHelper.getInputs();
            if (!inputs.protectBranchNames.includes(defaultBranch.data.default_branch)) {
                inputs.protectBranchNames.push(defaultBranch.data.default_branch);
                core.debug(`Insert ${defaultBranch.data.default_branch} into protected branches list`);
            }
            const branches = yield octokit.rest.repos.listBranches({
                owner: targetOwner,
                repo: targetRepo,
                protected: false,
                per_page: 50,
                headers: {
                    accept: 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28',
                },
            });
            const targetBranches = yield branchHelper.filterByBranches(branches, inputs);
            if (targetBranches.length === 0) {
                core.info('No branch need to delete, your repo is shiny!');
                return;
            }
            for (const branch in targetBranches) {
                const branchDetail = yield octokit.rest.repos.getBranch({
                    owner: targetOwner,
                    repo: targetRepo,
                    branch: branch,
                    headers: {
                        accept: 'application/vnd.github+json',
                        'X-GitHub-Api-Version': '2022-11-28',
                    },
                });
                if (yield branchHelper.filterByDate(branchDetail, inputs, new Date())) {
                    // branches remains on previous step, whether it's commit ahead default branch or not
                    const result = yield octokit.rest.repos.compareCommitsWithBasehead({
                        owner: targetOwner,
                        repo: targetRepo,
                        basehead: `${defaultBranch.data.default_branch}...${branchDetail.data.name}`,
                        mediaType: { format: 'json' },
                        headers: {
                            accept: 'application/vnd.github+json',
                            'X-GitHub-Api-Version': '2022-11-28',
                        },
                    });
                    core.info(`branch ${branchDetail.data.name} compare with ${defaultBranch.data.default_branch} status:${result.data.status}`);
                    if (!inputs.isForceDelete && result.data.ahead_by > 0) {
                        core.info(`Will not delete branch:${branchDetail.data.name} cause of isForceDelete:${inputs.isForceDelete} && ahead commit:${result.data.ahead_by}`);
                        return;
                    }
                    yield octokit.rest.git.deleteRef({
                        owner: targetOwner,
                        repo: targetRepo,
                        ref: branchDetail.data.name,
                        headers: {
                            accept: 'application/vnd.github+json',
                            'X-GitHub-Api-Version': '2022-11-28',
                        },
                    });
                    core.info(`Delete branch:${branchDetail.data.name}} finished.`);
                }
            }
        }
        catch (err) {
            core.setFailed(err.message);
        }
    });
}
exports.run = run;
//# sourceMappingURL=main.js.map