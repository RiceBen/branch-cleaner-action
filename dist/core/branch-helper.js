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
exports.filterByDate = exports.filterByBranches = void 0;
const core = __importStar(require("@actions/core"));
function filterByBranches(branches, settings) {
    return __awaiter(this, void 0, void 0, function* () {
        if (branches.data.length === 0) {
            core.warning('Cannot get non-protected branches from repo');
            return [];
        }
        const result = branches.data
            .map(item => {
            const { name } = item;
            return { name };
        })
            .filter(item => !settings.protectBranchNames.includes(item.name));
        return result.map(item => {
            return item.name;
        });
    });
}
exports.filterByBranches = filterByBranches;
function filterByDate(branch, settings, present_date) {
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, void 0, function* () {
        // check the branch latest commit date
        if (isNaN(Date.parse((_b = (_a = branch.data.commit.commit.committer) === null || _a === void 0 ? void 0 : _a.date) !== null && _b !== void 0 ? _b : ''))) {
            core.warning(`Cannot convert the latest commit date from ${(_d = (_c = branch.data.commit.commit.committer) === null || _c === void 0 ? void 0 : _c.date) !== null && _d !== void 0 ? _d : ''} to a Date object on the ${branch.data.name} branch, will not delete this branch.`);
            return false;
        }
        const one_day = 1000 * 60 * 60 * 24;
        const latest_commit_date = new Date((_f = (_e = branch.data.commit.commit.committer) === null || _e === void 0 ? void 0 : _e.date) !== null && _f !== void 0 ? _f : '');
        const result = Math.round(present_date.getTime() -
            latest_commit_date.setDate(latest_commit_date.getDate() + settings.expiryDays) /
                one_day);
        return result <= 0;
    });
}
exports.filterByDate = filterByDate;
//# sourceMappingURL=branch-helper.js.map