// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const fs = require('fs/promises');
const path = require('path');
const {
    commonAdbConfigs,
    delayAllCommands,
    emulatorDeviceName,
    physicalDeviceName1,
    physicalDeviceName2,
    simulateNoDevicesConnected,
    simulateServiceNotInstalled,
    simulateServiceInstallationError,
    simulateServiceLacksPermissions,
    simulateCallContentError,
    simulateReadContentError,
    simulateInputKeyeventError,
} = require('./common-adb-configs');
const { fileWithExpectedLoggingPath, fileWithMockAdbConfig } = require('./common-file-names.js');

const mockAdbFolder = path.join(__dirname, '../../../../drop/mock-adb');

const binPath = path.join(mockAdbFolder, process.platform === 'win32' ? 'adb.exe' : 'adb');
const configPath = path.join(mockAdbFolder, fileWithMockAdbConfig);

async function setupMockAdb(config, logFolderName, ...extraLogNames) {
    let filehandle;
    try {
        filehandle = await fs.open(binPath);
    } catch (err) {
        throw new Error(
            `Could not find mock-adb executable at expected path "${binPath}", try rebuilding with yarn build:mock-adb`,
        );
    } finally {
        await filehandle?.close();
    }

    try {
        await fs.writeFile(
            path.join(mockAdbFolder, fileWithExpectedLoggingPath),
            path.join(logFolderName, ...extraLogNames),
        );
    } catch (err) {
        console.error(err);
    }

    try {
        await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    mockAdbFolder,
    setupMockAdb,
    commonAdbConfigs,
    delayAllCommands,
    emulatorDeviceName,
    physicalDeviceName1,
    physicalDeviceName2,
    simulateNoDevicesConnected,
    simulateServiceNotInstalled,
    simulateServiceInstallationError,
    simulateServiceLacksPermissions,
    simulateCallContentError,
    simulateReadContentError,
    simulateInputKeyeventError,
};
