// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const { execFileSync } = require('node:child_process');
const metaDevMv3 = require('./meta-dev-mv3.json');
const metaExtension = require('./meta-extension.json');
const metaProd = require('./meta-prod.json');
const metaReport = require('./meta-report.json');

function esbuildFileDirectory(directory = {}) {
    const products = {
        extension: metaExtension,
        'extension (MV3)': metaDevMv3,
        prod: metaProd,
        report: metaReport,
    };

    execFileSync('node', ['esbuild.js', '--metafile=true']);
    execFileSync('node', ['esbuild.js', '--metafile=true', '--env=dev-mv3']);
    execFileSync('node', ['esbuild.js', '--metafile=true', '--env=prod']);
    execFileSync('node', ['esbuild.js', '--metafile=true', ' --env=report']);

    for (const product of Object.keys(products)) {
        const data = products[product];
        for (let file of Object.keys(data)) {
            if (!file.startsWith('src/') && !file.startsWith('css-modules:src/')) continue;

            // Add initial file to directory
            addToDirectory(file, product);

            // Check imports for the file
            const { imports } = data[file];
            const paths = imports.map(f => f.path);
            for (let path of paths) {
                addToDirectory(path, product);
            }
        }
    }

    function addToDirectory(path, product) {
        // Only include files in src directory
        if (!path.startsWith('src/') && !path.startsWith('css-modules:src/')) return;

        // Transform pattern for css-modules
        if (path.startsWith('css-modules:src/')) {
            path = `${path.replace('css-modules:', '')}.scss`;
        }

        // If path isn't in directory, create product array.
        if (!directory[path]) directory[path] = [];

        // Add product to array if the product isn't already added
        if (!directory[path].includes(product)) {
            directory[path] = directory[path].concat(product);
        }
    }

    require('fs').writeFileSync('./tools/directory.json', JSON.stringify(directory, null, 2));
    return new Promise(resolve => {
        resolve(directory);
    });
}

module.exports = esbuildFileDirectory;
