'use strict';
import {getInputs} from '../src/core/input-helper';
import * as core from '@actions/core';
import mocked = jest.mocked;

jest.mock('@actions/core');

describe('input-helper input validation test suites', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('input expiry-period-in-days is letter', () => {
    // arrange
    mocked(core.getInput).mockReturnValueOnce('ThisIsLetter');

    // act & assert
    expect(async () => {
      await getInputs();
    }).rejects.toThrow(TypeError);
  });

  it('input expiry-period-in-days with letter and number', () => {
    // arrange
    mocked(core.getInput).mockReturnValueOnce('AKB48');

    // act & assert
    expect(async () => {
      await getInputs();
    }).rejects.toThrow(TypeError);
  });

  it('input expiry-period-in-days with space and number', async () => {
    // arrange
    mocked(core.getInput).mockReturnValueOnce(' 48 ');
    mocked(core.getMultilineInput).mockReturnValueOnce(['main']);
    mocked(core.getBooleanInput).mockReturnValueOnce(true);
    // act
    const result = await getInputs();
    // assert
    expect(result.expiryDays).toEqual(48);
  });

  it('input protect-branch-name has no branch', async () => {
    // arrange
    mocked(core.getInput).mockReturnValueOnce('45');
    mocked(core.getMultilineInput).mockReturnValueOnce([]);
    mocked(core.getBooleanInput).mockReturnValueOnce(true);
    // act
    const result = await getInputs();
    // assert
    expect(result.protectBranchNames.length).toEqual(0);
  });

  it('input protect-branch-name has only one branch', async () => {
    // arrange
    mocked(core.getInput).mockReturnValueOnce('90');
    mocked(core.getMultilineInput).mockReturnValueOnce(['some-branch']);
    mocked(core.getBooleanInput).mockReturnValueOnce(true);
    // act
    const result = await getInputs();
    // assert
    expect(result.protectBranchNames.length).toEqual(1);
  });

  it('input protect-branch-name has multiple branches', async () => {
    // arrange
    mocked(core.getInput).mockReturnValueOnce('30');
    mocked(core.getMultilineInput).mockReturnValueOnce(['main', 'master']);
    mocked(core.getBooleanInput).mockReturnValueOnce(true);
    // act
    const result = await getInputs();
    // assert
    expect(result.protectBranchNames.length).toEqual(2);
  });
});
